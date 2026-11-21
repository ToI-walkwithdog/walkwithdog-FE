import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import SvgIconAdd from "../assets/icons/icon-add.svg";
import SvgIconBack from "../assets/icons/icon-back.svg";
import SvgIconCalendar from "../assets/icons/icon-calendar.svg";
import SvgIconCamera from "../assets/icons/icon-camera.svg";
import SvgIconCheck from "../assets/icons/icon-check.svg";
import SvgIconChevronLeft from "../assets/icons/icon-chevron-left.svg";
import SvgIconChevronRight from "../assets/icons/icon-chevron-right.svg";
import SvgIconDogBody from "../assets/icons/icon-dog-body.svg";
import SvgIconDogPoop from "../assets/icons/icon-dog-poop.svg";
import SvgIconDogWater from "../assets/icons/icon-dog-water.svg";
import SvgIconDog from "../assets/icons/icon-dog.svg";
import SvgIconDownload from "../assets/icons/icon-download.svg";
import SvgIconError from "../assets/icons/icon-error.svg";
import SvgIconExpandMore from "../assets/icons/icon-expand-more.svg";
import SvgIconFootprints from "../assets/icons/icon-footprints.svg";
import SvgIconHelp from "../assets/icons/icon-help.svg";
import SvgIconInfo from "../assets/icons/icon-info.svg";
import SvgIconLocation from "../assets/icons/icon-location.svg";
import SvgIconMedicalServices from "../assets/icons/icon-medical-services.svg";
import SvgIconMore from "../assets/icons/icon-more.svg";
import SvgIconNotifications from "../assets/icons/icon-notifications.svg";
import SvgIconPause from "../assets/icons/icon-pause.svg";
import SvgIconPawStamp from "../assets/icons/icon-paw-stamp.svg";
import SvgIconPaw from "../assets/icons/icon-paw.svg";
import SvgIconPets from "../assets/icons/icon-pets.svg";
import SvgIconPhone from "../assets/icons/icon-phone.svg";
import SvgIconPlay from "../assets/icons/icon-play.svg";
import SvgIconPrevious from "../assets/icons/icon-previous.svg";
import SvgIconProfile from "../assets/icons/icon-profile.svg";
import SvgIconSchedule from "../assets/icons/icon-schedule.svg";
import SvgIconSettings from "../assets/icons/icon-settings.svg";
import SvgIconShield from "../assets/icons/icon-shield.svg";
import SvgIconStar from "../assets/icons/icon-star.svg";
import SvgIconStop from "../assets/icons/icon-stop.svg";
import SvgIconTune from "../assets/icons/icon-tune.svg";
import SvgIconUser from "../assets/icons/icon-user.svg";
import SvgIconWarning from "../assets/icons/icon-warning.svg";
import SvgVectorLocation from "../assets/icons/vector-location.svg";
import SvgVectorNext from "../assets/icons/vector-next.svg";

import { colors } from "../theme/tokens";

const iconSources = {
  "icon-add": SvgIconAdd,
  "icon-back": SvgIconBack,
  "icon-calendar": SvgIconCalendar,
  "icon-camera": SvgIconCamera,
  "icon-check": SvgIconCheck,
  "icon-chevron-left": SvgIconChevronLeft,
  "icon-chevron-right": SvgIconChevronRight,
  "icon-dog-body": SvgIconDogBody,
  "icon-dog-poop": SvgIconDogPoop,
  "icon-dog-water": SvgIconDogWater,
  "icon-dog": SvgIconDog,
  "icon-download": SvgIconDownload,
  "icon-error": SvgIconError,
  "icon-expand-more": SvgIconExpandMore,
  "icon-footprints": SvgIconFootprints,
  "icon-help": SvgIconHelp,
  "icon-info": SvgIconInfo,
  "icon-location": SvgIconLocation,
  "icon-medical-services": SvgIconMedicalServices,
  "icon-more": SvgIconMore,
  "icon-notifications": SvgIconNotifications,
  "icon-pause": SvgIconPause,
  "icon-paw-stamp": SvgIconPawStamp,
  "icon-paw": SvgIconPaw,
  "icon-pets": SvgIconPets,
  "icon-phone": SvgIconPhone,
  "icon-play": SvgIconPlay,
  "icon-previous": SvgIconPrevious,
  "icon-profile": SvgIconProfile,
  "icon-schedule": SvgIconSchedule,
  "icon-settings": SvgIconSettings,
  "icon-shield": SvgIconShield,
  "icon-star": SvgIconStar,
  "icon-stop": SvgIconStop,
  "icon-tune": SvgIconTune,
  "icon-user": SvgIconUser,
  "icon-warning": SvgIconWarning,
  "vector-location": SvgVectorLocation,
  "vector-next": SvgVectorNext,
} satisfies Record<string, ComponentType<SvgProps>>;

export type IconName = keyof typeof iconSources;

type IconProps = {
  name: IconName;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
};

export function Icon({
  name,
  size = 24,
  width,
  height,
  color = colors.text,
}: IconProps) {
  const SvgIcon = iconSources[name];
  return (
    <SvgIcon
      width={width ?? size}
      height={height ?? size}
      color={color}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}
