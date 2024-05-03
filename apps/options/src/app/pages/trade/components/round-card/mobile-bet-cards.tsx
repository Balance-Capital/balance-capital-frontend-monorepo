import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import ExpiredRoundCard from "./expired-round-card";
import StartRoundCard from "./start-round-card";
import CurrentRoundCard from "./current-round-card";
import UpcomingRoundCardMobile from "../overview-card/upcoming-round-card";
import SwiperClass from "swiper/types/swiper-class";

import "swiper/css";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../app/store";

const MobileBetCards = () => {
  const [swiperEnabled, setSwiperEnabled] = useState(true);
  const [swiper, setSwiper] = useState<SwiperClass>();
  const [activeSlide, setActiveSlide] = useState(1);

  const tourStepIndex = useSelector((state: RootState) => state.app.tourStepIndex);

  useEffect(() => {
    if (!swiper) return;
    if (swiperEnabled) {
      swiper.enable();
    } else {
      swiper.disable();
    }
  }, [swiperEnabled]);

  useEffect(() => {
    if (tourStepIndex === 5) {
      swiper?.slideTo(2);
    }
  }, [tourStepIndex]);

  return (
    <div id="mobile-bet-cards">
      <Swiper
        pagination={{
          type: "fraction",
        }}
        navigation={true}
        modules={[]}
        className="mySwiper"
        spaceBetween={50}
        initialSlide={1}
        onSwiper={(swiper) => setSwiper(swiper)}
        onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
      >
        <SwiperSlide className="h-fit flex justify-center">
          <ExpiredRoundCard />
        </SwiperSlide>
        <SwiperSlide className="h-fit flex justify-center">
          <CurrentRoundCard />
        </SwiperSlide>
        <SwiperSlide className="!self-center h-fit flex justify-center">
          <StartRoundCard setSwiperEnabled={setSwiperEnabled} />
        </SwiperSlide>
        <SwiperSlide className="!self-center h-fit flex justify-center">
          <UpcomingRoundCardMobile setSwiperEnabled={setSwiperEnabled} />
        </SwiperSlide>
      </Swiper>
      <div className="mt-20 flex gap-10 justify-center">
        {Array(4)
          .fill(1)
          .map((_, index) => (
            <div
              className={`w-[12px] h-[12px] cursor-pointer rounded-full ${
                index === activeSlide ? "bg-brandColor" : "bg-btnUnselectBgColor"
              }`}
              key={index}
              onClick={() => swiper?.slideTo(index)}
            ></div>
          ))}
      </div>
    </div>
  );
};

export default MobileBetCards;
