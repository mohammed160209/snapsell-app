/* Hugeicons (free set) behind short, app-level names.
   Every screen imports icons from here, so swapping a glyph is a one-line change. */
import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon, CakeIcon, Camera01Icon, Tick02Icon, ArrowLeft01Icon, ArrowRight01Icon, CookieIcon, ViewIcon, ViewOffSlashIcon,
  FireIcon, HandshakeIcon, Home09Icon, ImageAdd02Icon, RupeeCircleIcon, DashboardSquare02Icon, Leaf01Icon, Loading03Icon,
  Logout03Icon, Location01Icon, BubbleChatIcon, MoreHorizontalIcon, Package01Icon, PencilEdit02Icon, PlusSignIcon, Recycle03Icon,
  Search01Icon, SendHorizontalIcon, Settings02Icon, ShieldCheckIcon, TShirtIcon, ShoppingBag02Icon, ShoppingCart02Icon,
  SmartPhone01Icon, SparklesIcon, StarIcon, Store02Icon, Tag01Icon, Delete02Icon, ChartIncreaseIcon, DeliveryTruck01Icon,
  UserCircleIcon, UserGroupIcon, Wallet01Icon, Cancel01Icon, MinusSignIcon, CheckmarkCircle02Icon, CheckmarkBadge01Icon,
  PackageDeliveredIcon, Clock01Icon, AiMagicIcon, Sofa01Icon, HeadphonesIcon, Book02Icon, BicycleIcon, Fan01Icon, Backpack01Icon,
  Invoice01Icon, Analytics01Icon, StoreLocation01Icon, Coins01Icon, InformationCircleIcon, QrCodeIcon, FilterHorizontalIcon,
  ShoppingBagCheckIcon, Notification03Icon, Plant02Icon, DeliveryBox01Icon, Route02Icon,
} from '@hugeicons/core-free-icons';

const make = (icon, defaultStroke = 1.8) => {
  const C = ({ className = 'w-5 h-5', strokeWidth, size = 24, ...rest }) => (
    <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth ?? defaultStroke} color="currentColor" className={className} aria-hidden="true" {...rest} />
  );
  return C;
};

export const AlertTriangle = make(Alert02Icon);
export const Cake = make(CakeIcon);
export const Camera = make(Camera01Icon);
export const Check = make(Tick02Icon, 2.2);
export const ChevronLeft = make(ArrowLeft01Icon, 2);
export const ChevronRight = make(ArrowRight01Icon, 2);
export const Cookie = make(CookieIcon);
export const Eye = make(ViewIcon);
export const EyeOff = make(ViewOffSlashIcon);
export const Flame = make(FireIcon);
export const Handshake = make(HandshakeIcon);
export const Home = make(Home09Icon);
export const ImagePlus = make(ImageAdd02Icon);
export const IndianRupee = make(RupeeCircleIcon);
export const LayoutDashboard = make(DashboardSquare02Icon);
export const Leaf = make(Leaf01Icon);
export const Plant = make(Plant02Icon);
export const Loader2 = make(Loading03Icon, 2);
export const LogOut = make(Logout03Icon);
export const MapPin = make(Location01Icon);
export const MessageCircle = make(BubbleChatIcon);
export const MoreHorizontal = make(MoreHorizontalIcon, 2.2);
export const Package = make(Package01Icon);
export const Pencil = make(PencilEdit02Icon);
export const Plus = make(PlusSignIcon, 2.2);
export const Minus = make(MinusSignIcon, 2.2);
export const Recycle = make(Recycle03Icon);
export const Search = make(Search01Icon);
export const Send = make(SendHorizontalIcon);
export const Settings = make(Settings02Icon);
export const ShieldCheck = make(ShieldCheckIcon);
export const Shirt = make(TShirtIcon);
export const ShoppingBag = make(ShoppingBag02Icon);
export const ShoppingBagCheck = make(ShoppingBagCheckIcon);
export const ShoppingCart = make(ShoppingCart02Icon);
export const Smartphone = make(SmartPhone01Icon);
export const Sparkles = make(SparklesIcon);
export const AiMagic = make(AiMagicIcon);
export const Star = make(StarIcon);
export const Store = make(Store02Icon);
export const StoreLocation = make(StoreLocation01Icon);
export const Tag = make(Tag01Icon);
export const Trash2 = make(Delete02Icon);
export const TrendingUp = make(ChartIncreaseIcon);
export const Analytics = make(Analytics01Icon);
export const Truck = make(DeliveryTruck01Icon);
export const Box = make(DeliveryBox01Icon);
export const UserRound = make(UserCircleIcon);
export const Users = make(UserGroupIcon);
export const Wallet = make(Wallet01Icon);
export const Coins = make(Coins01Icon);
export const Invoice = make(Invoice01Icon);
export const X = make(Cancel01Icon, 2);
export const CheckCircle = make(CheckmarkCircle02Icon);
export const Verified = make(CheckmarkBadge01Icon);
export const Delivered = make(PackageDeliveredIcon);
export const Clock = make(Clock01Icon);
export const Info = make(InformationCircleIcon);
export const QrCode = make(QrCodeIcon);
export const Filter = make(FilterHorizontalIcon);
export const Bell = make(Notification03Icon);
export const Route = make(Route02Icon);
export const Sofa = make(Sofa01Icon);
export const Headphones = make(HeadphonesIcon);
export const Book = make(Book02Icon);
export const Bicycle = make(BicycleIcon);
export const Fan = make(Fan01Icon);
export const Backpack = make(Backpack01Icon);
