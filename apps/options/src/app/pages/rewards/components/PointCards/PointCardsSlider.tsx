import { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Scrollbar } from "swiper";
import { useSelector } from "react-redux";
import { differenceInDays, differenceInHours } from "date-fns";
import { RootState } from "../../../../../app/store";
import { useAccount } from "../../../../../app/hooks/useAccount";
import SwiperClass from "swiper/types/swiper-class";
import PointCard from "./PointCard";
import { Grid, Navigation, Pagination, Scrollbar } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { ITaskProgress } from "../../../../../app/store/reducers/reward-slice";
import { useNetworkContext } from "../../../../../app/context/NetworkContext";

const PointCardsSlider = () => {
  const [swiper, setSwiper] = useState<SwiperClass>();
  const [activeSlide, setActiveSlide] = useState(0);
  const { address } = useAccount();
  const tasks = useSelector((state: RootState) => state.reward.tasks);
  const taskTiers = useSelector((state: RootState) => state.reward.taskTiers);
  const taskProgress = useSelector((state: RootState) => state.reward.taskProgress);
  const currentSeason = useSelector((state: RootState) => state.reward.currentSeason);
  const { currentNetworkChainId } = useNetworkContext();

  const handleDate = (date: string) => {
    if (date) {
      const endDate = new Date(date);
      const daysDifference = differenceInDays(endDate, Date.now());
      if (daysDifference > 1) {
        return `Ending in ${daysDifference} days`;
      } else if (daysDifference === 1) {
        const hoursDifference = differenceInHours(endDate, Date.now());
        return `Ending in ${hoursDifference} hours`;
      } else {
        return "Expired";
      }
    } else {
      return "N/A";
    }
  };

  const getTasks = () => {
    if (tasks.length && taskTiers.length && Object.keys(currentSeason).length) {
      const _temp = tasks.map((obj) => ({
        id: obj.id,
        tier: "0/3",
        title: obj.title,
        description: obj.description ? obj.description : "N/A",
        ending: handleDate(currentSeason.end_time),
        completed: false,
      }));
      const _temp2 = _temp.map((obj) => {
        return {
          ...obj,
          points: `0/${taskTiers.reduce((prev, cur) => {
            return cur.task === obj.id ? prev + cur.point : prev;
          }, 0)}`,
        };
      });
      return _temp2;
    } else {
      return [];
    }
  };

  const data = useMemo(() => {
    if (address) {
      if (
        tasks.length &&
        taskProgress.length &&
        taskTiers.length &&
        Object.keys(currentSeason).length
      ) {
        const _temp = tasks.map((obj) => {
          const taskP =
            (taskProgress.find((obj1) => obj1.task === obj.id) as ITaskProgress) || {};
          let tiers = 0;
          const points =
            taskTiers.reduce((prev, cur) => {
              if (
                Object.keys(taskP).length &&
                cur.task === taskP.task &&
                cur.tier <= taskP.tier
              ) {
                ++tiers;
                prev += cur.point;
              }
              return prev;
            }, 0) || 0;
          return {
            id: obj.id,
            tier: `${tiers}/3`,
            title: obj.title,
            description: obj.description ? obj.description : "N/A",
            ending: handleDate(currentSeason.end_time),
            points: `${points}/${taskTiers.reduce((prev, cur) => {
              return cur.task === obj.id ? prev + cur.point : prev;
            }, 0)}`,
            completed:
              taskP && Object.keys(taskP).length && taskP.tier === 2 ? true : false,
          };
        });
        return _temp;
      }
    }
    return getTasks();
  }, [tasks, taskTiers, taskProgress, currentSeason, address, currentNetworkChainId]);

  return (
    <>
      <div className="xs:block sm:hidden">
        <Swiper
          pagination={{
            type: "fraction",
          }}
          navigation={true}
          modules={[]}
          className="mySwiper"
          spaceBetween={50}
          initialSlide={activeSlide}
          onSwiper={(swiper) => setSwiper(swiper)}
          onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
        >
          {data.map((item, i) => (
            <SwiperSlide key={item.id} className="h-fit flex justify-center">
              <PointCard
                className={`w-full min-w-[360px] max-w-450 h-450 p-25 bg-charcoalGray rounded-[2.5rem] border-obsidianBlack border-2 ${
                  item.ending === "Expired" && "opacity-50"
                }`}
                {...item}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="mt-20 flex gap-10 justify-center">
          {data.map((_, index) => (
            <div
              className={`w-[12px] h-[12px] cursor-pointer rounded-full ${
                index === activeSlide ? "bg-success" : "bg-disable"
              }`}
              key={`${_.id}${index}`}
              onClick={() => swiper?.slideTo(index)}
            ></div>
          ))}
        </div>
      </div>
      <div className="xs:hidden sm:block">
        <Swiper
          modules={[Grid, Pagination, Scrollbar, Navigation]}
          slidesPerView={4}
          scrollbar={{ draggable: true }}
          navigation
          pagination={{
            clickable: true,
          }}
          centeredSlides={true}
          centeredSlidesBounds={true}
          direction="horizontal"
          spaceBetween={40}
          className="[&>.swiper-button-prev]:flex [&>.swiper-button-next]:flex [&>.swiper-button-prev]:text-successTxtColor [&>.swiper-button-next]:text-successTxtColor [&>.swiper-scrollbar]:hidden"
        >
          {data.map((item, i) => {
            return i < 8 ? (
              <SwiperSlide
                key={item.id}
                className="min-w-[360px] max-w-450 h-fit flex justify-center"
              >
                <PointCard
                  className={`w-full min-w-[360px] max-w-450 h-450 p-25 bg-charcoalGray rounded-[2.5rem] border-obsidianBlack border-2 ${
                    item.ending === "Expired" && "opacity-50"
                  }`}
                  {...item}
                />
              </SwiperSlide>
            ) : (
              <></>
            );
          })}
        </Swiper>
      </div>
      <div className="xs:hidden sm:block">
        <Swiper
          modules={[Grid, Pagination, Scrollbar, Navigation]}
          slidesPerView={4}
          scrollbar={{ draggable: true }}
          navigation
          pagination={{
            clickable: true,
          }}
          centeredSlides={true}
          centeredSlidesBounds={true}
          direction="horizontal"
          spaceBetween={40}
          className="[&>.swiper-button-prev]:flex [&>.swiper-button-next]:flex [&>.swiper-button-prev]:text-successTxtColor [&>.swiper-button-next]:text-successTxtColor [&>.swiper-scrollbar]:hidden"
        >
          {data.map((item, i) => {
            return i >= 8 ? (
              <SwiperSlide
                key={item.id}
                className="min-w-[360px] max-w-450 h-fit flex justify-center"
              >
                <PointCard
                  className={`w-full min-w-[360px] max-w-450 h-450 p-25 bg-charcoalGray rounded-[2.5rem] border-obsidianBlack border-2 ${
                    item.ending === "Expired" && "opacity-50"
                  }`}
                  {...item}
                />
              </SwiperSlide>
            ) : (
              <></>
            );
          })}
        </Swiper>
      </div>
    </>
  );
};

export default PointCardsSlider;
