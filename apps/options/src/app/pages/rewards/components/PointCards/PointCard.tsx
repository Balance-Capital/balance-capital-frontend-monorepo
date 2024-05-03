interface IProps {
  tier: string;
  ending: string;
  title: string;
  description: string;
  points: string;
  completed: boolean;
  className: string;
}

function PointCard({
  tier,
  ending,
  title,
  description,
  points,
  completed,
  className,
}: IProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-10">
        <div className="relative min-w-[100px] max-w-[120px]">
          <svg
            className="w-full h-full relative"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 158.139 45.143"
          >
            <path
              id="Path_3998"
              data-name="Path 3998"
              d="M0,19.5V36.131a9.012,9.012,0,0,0,9.012,9.011H149.127a9.012,9.012,0,0,0,9.012-9.011V9.012A9.012,9.012,0,0,0,149.127,0H17.844a9.012,9.012,0,0,0-6.892,3.205L2.12,13.689A9.011,9.011,0,0,0,0,19.5"
              transform="translate(0 0)"
              fill="#071f1d"
            />
          </svg>
          <div className="absolute inset-0 font-OcrExtendedRegular xs:text-12 sm:text-15 flex items-center justify-center text-success">
            TIER {tier}
          </div>
        </div>
        <div className="min-h-[34.24px] w-[fit-content] bg-[#10181A] font-InterMedium xs:text-12 sm:text-15 text-second rounded-full flex items-center justify-center gap-10 px-10">
          <svg
            id="Group_13579"
            data-name="Group 13579"
            xmlns="http://www.w3.org/2000/svg"
            width="20.212"
            height="20.212"
            viewBox="0 0 20.212 20.212"
          >
            <g
              id="Ellipse_1019"
              data-name="Ellipse 1019"
              transform="translate(20.212 20.212) rotate(180)"
              fill="none"
              stroke="#5b7481"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <circle cx="10.106" cy="10.106" r="10.106" stroke="none" />
              <circle cx="10.106" cy="10.106" r="9.106" fill="none" />
            </g>
            <path
              id="Path_3689"
              data-name="Path 3689"
              d="M4.577,5.231V0H0"
              transform="translate(14.475 10.98) rotate(180)"
              fill="none"
              stroke="#5b7481"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              fillRule="evenodd"
            />
          </svg>
          {ending}
        </div>
      </div>
      <div className="h-[calc(100%-10%)] flex flex-col items-center justify-center gap-[35px]">
        <div className="xs:space-y-5 sm:space-y-15 text-center">
          <h2 className="font-InterMedium xs:text-24 sm:text-28 text-lightwhite">
            {title}
          </h2>
          <p className="font-InterRegular text-16 text-second xs:w-full sm:w-[80%] mx-auto">
            {description}
          </p>
        </div>
        <div className="relative min-w-160 max-w-200">
          {!completed ? (
            <>
              <svg
                className="relative"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 243.309 86.142"
              >
                <g
                  id="Group_15192"
                  data-name="Group 15192"
                  transform="translate(-238 -601.213)"
                >
                  <path
                    id="Union_380"
                    data-name="Union 380"
                    d="M10.976,84.143A10.75,10.75,0,0,1,0,73.633V22.739a10.246,10.246,0,0,1,2.582-6.773L13.34,3.74A11.178,11.178,0,0,1,21.733,0h208.6A10.751,10.751,0,0,1,241.31,10.512V61.405a10.246,10.246,0,0,1-2.582,6.773L227.971,80.405a11.18,11.18,0,0,1-8.393,3.738Z"
                    transform="translate(238.999 602.212)"
                    fill="#12b3a8"
                    stroke="#13c9bd"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  />
                </g>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-InterMedium text-18 text-black">
                {points} pts
              </div>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="relative"
                viewBox="0 0 243.309 86.142"
              >
                <path
                  id="Union_380"
                  data-name="Union 380"
                  d="M10.976,84.143A10.75,10.75,0,0,1,0,73.633V22.739a10.246,10.246,0,0,1,2.582-6.773L13.34,3.74A11.178,11.178,0,0,1,21.733,0h208.6A10.751,10.751,0,0,1,241.31,10.512V61.405a10.246,10.246,0,0,1-2.582,6.773L227.971,80.405a11.18,11.18,0,0,1-8.393,3.738Z"
                  transform="translate(0.999 0.999)"
                  fill="none"
                  stroke="#12b3a8"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-InterMedium text-18 text-success">
                {points} pts
              </div>
            </>
          )}
        </div>
        {!completed ? (
          <div className="bg-[#10181A] font-InterMedium text-15 text-second rounded-full flex items-center justify-center px-15 py-5">
            Incomplete
          </div>
        ) : (
          <div className="bg-[#071F1D] font-InterMedium text-15 text-success rounded-full flex items-center justify-center px-15 py-5">
            Completed
          </div>
        )}
      </div>
    </div>
  );
}

export default PointCard;
