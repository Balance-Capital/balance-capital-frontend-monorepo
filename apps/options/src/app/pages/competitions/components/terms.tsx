import React from "react";
import { ICompetiton } from "../mock";

const Terms = ({ currentCompetitionData }: { currentCompetitionData: ICompetiton }) => {
  return (
    <div className="px-40 py-40 rounded-3xl bg-deepSea border-2 border-obsidianBlack space-y-20">
      <div className="text-24 text-lightwhite xs:text-center md:text-start">
        Terms & Conditions
      </div>
      <div
        className="text-second text-14 [&>a]:underline"
        dangerouslySetInnerHTML={{ __html: currentCompetitionData.termAndCondition }}
      ></div>
    </div>
  );
};

export default Terms;
