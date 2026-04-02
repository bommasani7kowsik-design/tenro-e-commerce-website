import Map "mo:core/Map";
import List "mo:core/List";
import Stripe "stripe/stripe";

module {
  type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    sizes : [Text];
    categories : [Text];
    images : [Blob];
    inventory : Nat;
  };

  type Order = {
    id : Text;
    user : ?Principal;
    items : [OrderItem];
    total : Nat;
    paymentStatus : PaymentStatus;
    orderStatus : OrderStatus;
    timestamp : Int;
  };

  type OrderItem = {
    productId : Text;
    quantity : Nat;
    size : Text;
  };

  type PaymentStatus = {
    #pending;
    #completed;
    #failed;
  };

  type OrderStatus = {
    #processing;
    #shipped;
    #delivered;
    #cancelled;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    address : ?Text;
    mobileNumber : Text;
  };

  type ShoppingCartItem = {
    productId : Text;
    quantity : Nat;
    size : Text;
  };

  public type StripeSessionStatus = Stripe.StripeSessionStatus;

  type OldActor = {
    var _orderCounter : Nat;
    products : Map.Map<Text, Product>;
    orders : Map.Map<Text, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    checkoutSessions : Map.Map<Text, Principal>;
    shoppingCarts : Map.Map<Principal, List.List<ShoppingCartItem>>;
    var stripeConfig : ?Stripe.StripeConfiguration;
    var PERMANENT_ADMIN_MOBILE : Text;
  };

  type NewActor = {
    var _orderCounter : Nat;
    products : Map.Map<Text, Product>;
    orders : Map.Map<Text, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    checkoutSessions : Map.Map<Text, Principal>;
    shoppingCarts : Map.Map<Principal, List.List<ShoppingCartItem>>;
    var stripeConfig : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    {
      var _orderCounter = old._orderCounter;
      products = old.products;
      orders = old.orders;
      userProfiles = old.userProfiles;
      checkoutSessions = old.checkoutSessions;
      shoppingCarts = old.shoppingCarts;
      var stripeConfig = old.stripeConfig;
    };
  };
};
