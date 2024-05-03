/* eslint-disable node/no-unsupported-features/es-syntax */
import "react-multi-carousel/lib/styles.css";
import { useNavigate, useParams } from "react-router-dom";
import { lazy, useEffect, useState } from "react";

import { CryptoCurrency } from "../../core/types/basic.types";

import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar } from "swiper/modules";
import "swiper/css/bundle";
import "swiper/css/virtual";
import { LoadingBoundary } from "../../components/LoadingBoundary/LoadingBoundary";
import usePageTitle from "../../hooks/usePageTitle";
import { emitHomeMainTeaserButtonClickTrack } from "../../helpers/analytics";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useDispatch } from "react-redux";
import { setRefCode } from "../../store/reducers/referrals-slice";
import { useAccount } from "../../hooks/useAccount";
import PointAchievementAlert from "../../components/alerts/points-achievement-alert";

const TrendingPad = lazy(async () => import("../../components/trending/trending-pad"));
const TrendingMarket = lazy(
  async () => import("../../components/trending/trending-market")
);
const DemoModal = lazy(async () => import("../../components/demo-modal/demo-modal"));

export const HomePage = (): JSX.Element => {
  const dispatch = useDispatch();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const bettingCryptoCurrencies = useSelector(
    (state: RootState) => state.trade.bettingCryptoCurrencies
  );
  const navigate = useNavigate();
  const { address } = useAccount();
  const pageTitle = usePageTitle();
  const { refCode } = useParams();

  useEffect(() => {
    if (refCode) {
      dispatch(setRefCode(refCode));
    }
  }, [refCode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTradeClick = () => {
    navigate("/trade?underlyingToken=eth");
    if (address) {
      emitHomeMainTeaserButtonClickTrack(pageTitle, address, "Trade");
    }
  };

  const handleClickDemo = () => {
    setDemoModalOpen(true);
    if (address) {
      emitHomeMainTeaserButtonClickTrack(pageTitle, address, "Demo");
    }
  };

  return (
    <div>
      <PointAchievementAlert
        points={500}
        title="‘Completionist’ unlocked"
        imgType="completionist"
        description={
          <>
            <span className="text-yellowTxtColor">You’ve unlocked all achievements</span>{" "}
          </>
        }
        open={false}
        handleClose={() => {}}
      />
      <div className="w-full h-[462px] md:h-[1070px] flex flex-col bg-[url('./assets/images/bg-img-lg.jpg')] bg-cover bg-no-repeat bg-center">
        <div className="grow flex items-center xs:mx-0 sm:mx-auto md:mx-0">
          <div className="mt-auto xs:mb-[30px] md:mb-[100px] w-[400px] sm:w-fit md:w-[800px] px-[12px] md:px-[90px] xs:text-start sm:text-center md:text-start">
            <h1 className="font-OcrExtendedRegular text-12 md:text-15 text-success">
              CRYPTO TRADING
            </h1>
            <p className="mt-[13px] md:mt-20 font-InterLight md:font-InterRegular text-34 md:text-55 text-primary leading-10 md:leading-[70px]">
              One-tap crypto trading platform
            </p>
            <div className="w-['fit-content'] mt-[23px] md:mt-40 flex items-center xs:justify-start sm:justify-center md:justify-start gap-10 md:gap-20 text-11 md:text-18 [&>button]:w-[128px] [&>button]:h-[38px] md:[&>button]:w-[200px] md:[&>button]:h-[60px] [&>button]:rounded-[20px]">
              <button
                className="bg-success hover:bg-success-hover text-buttontext"
                onClick={handleTradeClick}
              >
                Trade
              </button>
              <button
                className="bg-transparent text-buttontext border-2 border-success hover:bg-success transition-all"
                onClick={handleClickDemo}
              >
                Demo
              </button>
            </div>
          </div>
        </div>
        <LoadingBoundary>
          <Swiper
            modules={[Scrollbar]}
            slidesPerView="auto"
            scrollbar={{ draggable: true, el: "none" }}
            centeredSlides={true}
            centeredSlidesBounds={true}
            direction="horizontal"
            className="xs:hidden md:block w-full my-[100px] px-[90px] last:[&>.swiper-wrapper>.swiper-slide]:mr-0"
          >
            {bettingCryptoCurrencies.map((item: CryptoCurrency, i: number) => {
              return (
                <SwiperSlide
                  style={{ cursor: "grab" }}
                  className="w-[300px] h-[160px] md:w-[470px] md:h-[250px] xs:mr-10 md:mr-[140px]"
                  key={item.symbol}
                >
                  <TrendingPad sourceToken="USD" underlyingToken={item} />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </LoadingBoundary>
      </div>
      <LoadingBoundary>
        <Swiper
          modules={[Scrollbar]}
          slidesPerView="auto"
          scrollbar={{ draggable: true, el: "none" }}
          centeredSlides={true}
          centeredSlidesBounds={true}
          direction="horizontal"
          className="xs:block md:hidden w-full my-[30px] px-[12px] last:[&>.swiper-wrapper>.swiper-slide]:mr-0"
        >
          {bettingCryptoCurrencies.map((item: CryptoCurrency, i: number) => {
            return (
              <SwiperSlide
                style={{ cursor: "grab" }}
                className="w-[300px] h-[160px] md:w-[470px] md:h-[250px] xs:mr-10 md:mr-[140px]"
                key={item.symbol}
              >
                <TrendingPad sourceToken="USD" underlyingToken={item} />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </LoadingBoundary>
      <div className="trending-markets xs:px-10 sm:px-30 md:px-70 pt-0 md:pt-100 pb-50">
        <p className="trending-markets-title font-InterLight xs:text-30 sm:text-40 text-primary mb-30">
          Trending markets
        </p>
        <div className="overflow-auto">
          <table className="xs:min-w-[1024px] xl:min-w-[1280px] w-full border-separate borderSpacing">
            <thead>
              <tr className="text-left font-InterRegular xs:text-16 lg:text-17 [&>th]:text-lightgray [&>th]:font-normal">
                <th className="pl-30">Pair</th>
                <th>Price</th>
                <th>24h change</th>
                <th className="text-right">24h vol</th>
                <th className="text-right">24h chart</th>
                <th className="pr-30"></th>
              </tr>
            </thead>
            <LoadingBoundary>
              <tbody className="">
                {bettingCryptoCurrencies.map((item: CryptoCurrency) => {
                  return (
                    <TrendingMarket
                      sourceToken="USD"
                      underlyingToken={item}
                      isJackpot={false}
                      key={item.symbol}
                    />
                  );
                })}
              </tbody>
            </LoadingBoundary>
          </table>
        </div>
      </div>
      <DemoModal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};

export default HomePage;
