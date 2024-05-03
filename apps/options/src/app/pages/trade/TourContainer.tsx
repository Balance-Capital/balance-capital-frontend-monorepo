import { useEffect, useState } from "react";
import { ShepherdTour, Tour } from "react-shepherd";
import { steps } from "./data/tourSteps";
import { mobileSteps } from "./data/tourSteps";
import Trade from "./trade";
// eslint-disable-next-line node/no-extraneous-import
import "shepherd.js/dist/css/shepherd.css";
import { useDispatch } from "react-redux";
import { setTourStepIndex } from "../../store/reducers/app-slice";

const tourOptions: Tour.TourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: false,
    },
    classes: "tour-tooltip",
    scrollTo: true,
    scrollToHandler: function (e) {
      const bodyRect = document.body.getBoundingClientRect();
      window.scrollTo({
        // top: e.getBoundingClientRect().top - 200,
        top: e.getBoundingClientRect().top - bodyRect.top - 200,
        behavior: "smooth",
        left: 0,
      });
    },
    highlightClass: "bg-red/20",
  },
  useModalOverlay: true,
};

const TourContainer = () => {
  const [customizedSteps, setCustomizedSteps] = useState(mobileSteps);

  const dispatch = useDispatch();

  useEffect(() => {
    if (window.innerWidth < 600) {
      setCustomizedSteps(
        mobileSteps.map((step, index) => ({
          ...step,
          when: { show: () => dispatch(setTourStepIndex(index + 1)) },
        }))
      );
    } else {
      setCustomizedSteps(steps);
    }
  }, []);

  return (
    <ShepherdTour steps={customizedSteps} tourOptions={tourOptions}>
      <Trade />
    </ShepherdTour>
  );
};

export default TourContainer;
