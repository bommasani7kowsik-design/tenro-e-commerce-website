import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    sizes : [Text];
    categories : [Text];
    images : [Storage.ExternalBlob];
    inventory : Nat;
  };

  public type Order = {
    id : Text;
    user : ?Principal;
    items : [OrderItem];
    total : Nat;
    paymentStatus : PaymentStatus;
    orderStatus : OrderStatus;
    timestamp : Time.Time;
  };

  public type OrderItem = {
    productId : Text;
    quantity : Nat;
    size : Text;
  };

  public type PaymentStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type OrderStatus = {
    #processing;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    address : ?Text;
    mobileNumber : Text;
  };

  public type StripeSessionStatus = Stripe.StripeSessionStatus;

  public type ShoppingCartItem = {
    productId : Text;
    quantity : Nat;
    size : Text;
  };

  var _orderCounter = 0;
  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Text, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let checkoutSessions = Map.empty<Text, Principal>();
  let shoppingCarts = Map.empty<Principal, List.List<ShoppingCartItem>>();
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  let KOWSIK_MOBILE = "7569114467";
  let ADMIN_OTP = "1234";

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  func findPrincipalByMobile(mobileNumber : Text) : ?Principal {
    for ((principal, profile) in userProfiles.entries()) {
      if (profile.mobileNumber == mobileNumber) {
        return ?principal;
      };
    };
    null;
  };

  // Auto-assign #user role on first profile creation, promote first Kowsik user to admin
  func checkAndAssignKowsikAdmin(caller : Principal, profile : UserProfile) {
    if (profile.mobileNumber == KOWSIK_MOBILE) {
      AccessControl.initialize(accessControlState, caller, "unused", "unused");
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    checkAndAssignKowsikAdmin(caller, profile);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func clearFirstAdminStateAndDemoteAll() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear admin state");
    };

    let allUsers = userProfiles.keys().toArray();
    for (user in allUsers.values()) {
      if (user != caller) {
        AccessControl.assignRole(accessControlState, caller, user, #user);
      };
    };
  };

  // Fixed admin login for first admin (Kowsik)
  public type AdminLoginStatus = {
    #success;
    #invalidOtp;
    #invalidMobile;
    #invalidSession;
    #unauthorized;
  };

  public shared ({ caller }) func authorizeAdmin(loginId : Text, otp : Text) : async AdminLoginStatus {
    // Verify OTP
    if (otp != ADMIN_OTP) {
      return #invalidOtp;
    };

    // Must use the fixed Kowsik mobile number for login
    if (loginId != KOWSIK_MOBILE) {
      return #invalidMobile;
    };

    // CRITICAL FIX: Verify the caller actually owns a profile with this mobile number
    switch (userProfiles.get(caller)) {
      case (null) {
        // Caller has no profile at all
        return #invalidSession;
      };
      case (?callerProfile) {
        // Verify the caller's profile has the matching mobile number
        if (callerProfile.mobileNumber != KOWSIK_MOBILE) {
          return #unauthorized;
        };

        // Successfully authenticated: caller owns the profile with Kowsik's mobile
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          // Try to initialize as first admin, if not admin yet
          AccessControl.initialize(accessControlState, caller, "unused", "unused");
        };

        return #success;
      };
    };
  };

  // Admin role assignment - Protected by AccessControl.assignRole internal guards
  public shared ({ caller }) func assignRole(user : Principal, role : AccessControl.UserRole) : async () {
    // This function internally calls AccessControl.assignRole which has admin-only guards
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func getUserRole(user : Principal) : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, user);
  };

  public query ({ caller }) func isAdmin(user : Principal) : async Bool {
    AccessControl.isAdmin(accessControlState, user);
  };

  // Product management - Admin only
  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  // Product viewing - Public (no auth required)
  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProduct(id : Text) : async ?Product {
    products.get(id);
  };

  // Order management
  public shared ({ caller }) func createOrder(order : Order) : async Text {
    switch (order.user) {
      case (?orderUser) {
        if (caller != orderUser and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only create orders for yourself unless you are an admin");
        };
      };
      case (null) {
        // Guest order - no authentication required
      };
    };

    let orderId = order.id;
    orders.add(orderId, order);
    _orderCounter += 1;
    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          user = order.user;
          items = order.items;
          total = order.total;
          paymentStatus = order.paymentStatus;
          orderStatus = status;
          timestamp = order.timestamp;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Text) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        switch (order.user) {
          case (?orderUser) {
            // User can view their own order, admin can view any order
            if (caller != orderUser and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own orders unless you are an admin");
            };
          };
          case (null) {
            // Guest order - only admin can view
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only admins can view guest orders");
            };
          };
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getUserOrders(user : Principal) : async [Order] {
    // User can view their own orders, admin can view any user's orders
    if (caller != user and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Can only view your own orders unless you are an admin");
    };

    let userOrders = orders.values().toArray().filter(
      func(o) {
        switch (o.user) {
          case (?u) { u == user };
          case (null) { false };
        };
      }
    );
    userOrders;
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Stripe integration
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    let config = switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?c) { c };
    };
    await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async StripeSessionStatus {
    let config = switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?c) { c };
    };
    await Stripe.getSessionStatus(config, sessionId, transform);
  };

  // Shopping Cart Management - User only
  public query ({ caller }) func getCartItems() : async [ShoppingCartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access cart");
    };
    switch (shoppingCarts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func addCartItem(item : ShoppingCartItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add to cart");
    };

    let currentCart = switch (shoppingCarts.get(caller)) {
      case (null) { List.empty<ShoppingCartItem>() };
      case (?cart) { cart };
    };

    var found = false;
    let updatedCart = List.empty<ShoppingCartItem>();
    for (cartItem in currentCart.values()) {
      if (cartItem.productId == item.productId and cartItem.size == item.size) {
        updatedCart.add({
          productId = cartItem.productId;
          quantity = cartItem.quantity + item.quantity;
          size = cartItem.size;
        });
        found := true;
      } else {
        updatedCart.add(cartItem);
      };
    };

    if (not found) {
      updatedCart.add(item);
    };

    shoppingCarts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeCartItem(productId : Text, size : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove from cart");
    };

    switch (shoppingCarts.get(caller)) {
      case (null) { () };
      case (?cart) {
        let filteredCart = List.empty<ShoppingCartItem>();
        for (cartItem in cart.values()) {
          if (cartItem.productId != productId or cartItem.size != size) {
            filteredCart.add(cartItem);
          };
        };
        shoppingCarts.add(caller, filteredCart);
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can clear cart");
    };
    shoppingCarts.remove(caller);
  };

  public shared ({ caller }) func updateCartItemQuantity(productId : Text, size : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update cart");
    };

    switch (shoppingCarts.get(caller)) {
      case (null) { () };
      case (?cart) {
        let updatedCart = List.empty<ShoppingCartItem>();
        for (cartItem in cart.values()) {
          if (cartItem.productId == productId and cartItem.size == size) {
            updatedCart.add({
              productId = productId;
              quantity;
              size;
            });
          } else {
            updatedCart.add(cartItem);
          };
        };
        shoppingCarts.add(caller, updatedCart);
      };
    };
  };

  // Outcall transformation - Public query
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Expose the order counter for migration/access if needed
  public query ({ caller }) func getOrderCounter() : async Nat {
    _orderCounter;
  };
};

