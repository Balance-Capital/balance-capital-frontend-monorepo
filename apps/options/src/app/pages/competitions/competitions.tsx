import { useMemo } from "react";

import { useParams } from "react-router-dom";
import { ICompetiton, getCompetitionById } from "./mock";
import ShowCompetition from "./components/show-competition";

const Competitions = () => {
  const { id } = useParams();
  const currentCompetitonData = useMemo(
    () => (id ? getCompetitionById(+id) : ({} as ICompetiton)),
    [id]
  );

  return currentCompetitonData?.id ? (
    <ShowCompetition currentCompetitonData={currentCompetitonData} />
  ) : (
    <div className="min-h-[calc(100vh-400px)] flex items-center justify-center font-InterMedium text-30 text-second">
      No competition found.
    </div>
  );
};

export default Competitions;
