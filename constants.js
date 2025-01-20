import { Dimensions, LogBox } from "react-native";

const ICONS = {
  menu: require("./assets/media/menu.png"),
  cart: require("./assets/media/cart.png"),
  account: require("./assets/media/account.png"),
  search: require("./assets/media/search.png"),
  wallet: require("./assets/media/wallet.png"),
  back: require("./assets/media/back.png"),
  wave: require("./assets/media/wave.png"),
  add: require("./assets/media/add.png"),
  minus: require("./assets/media/minus.png"),
  down: require("./assets/media/down.png"),
  cover: require("./assets/media/cover.png"),
  check: require("./assets/media/check.png"),
  delivery: require("./assets/media/delivery.png"),
  pickup: require("./assets/media/pickup.png"),
  logo: require("./assets/media/logo.png"),
  close: require("./assets/media/close.png"),
  profile: require("./assets/media/profile.jpg"),
  next: require("./assets/media/next.png"),
  phone: require("./assets/media/phone.png"),
  location: require("./assets/media/location.png"),
  creditCard: require("./assets/media/credit-card.png"),
  coupon: require("./assets/media/coupon.png"),
  lock: require("./assets/media/lock.png"),
  settings: require("./assets/media/settings.png"),
  support: require("./assets/media/support.png"),
  terms: require("./assets/media/terms.png"),
  logout: require("./assets/media/logout.png"),
  more: require("./assets/media/more.png"),
  orders: require("./assets/media/orders.png"),
  timer: require("./assets/media/timer.png"),
  barcode: require("./assets/media/barcode.png"),
  loading: require("./assets/media/loading.gif"),
  show: require("./assets/media/show.png"),
  hide: require("./assets/media/hide.png"),
  google: require("./assets/media/google.png"),
  fingerprint: require("./assets/media/fingerprint.png"),
  envelope: require("./assets/media/envelope.png"),
  password: require("./assets/media/password.png"),
  calendar: require("./assets/media/calendar.png"),
  allergenic: require("./assets/media/allergenic.png"),
  filter: require("./assets/media/filter.png"),
};

const PAYMENTS = {
  amex: require("./assets/cards/amex.png"),
  applePay: require("./assets/cards/apple_pay.png"),
  diners: require("./assets/cards/diners.png"),
  eftpos: require("./assets/cards/eftpos.png"),
  googlePay: require("./assets/cards/google_pay.png"),
  jcb: require("./assets/cards/jcb.png"),
  link: require("./assets/cards/link.png"),
  mastercard: require("./assets/cards/mastercard.png"),
  RTA: require("./assets/cards/RTA.png"),
  unionPay: require("./assets/cards/unionpay.png"),
  visa: require("./assets/cards/visa.png"),
};

const IMAGES = {
  1: require("./assets/restaurants/1.jpg"),
  burger: require("./assets/media/burger.jpg"),
  internalStadium: require("./assets/media/stadium_internal.png"),
};

const THEME = {
  screenWidth: Dimensions.get("window").width,
  screenHeight: Dimensions.get("window").height,
};

export { ICONS, THEME, IMAGES, PAYMENTS };
