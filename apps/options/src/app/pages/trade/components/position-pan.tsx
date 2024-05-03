import StartRoundCard from "./round-card/start-round-card";
import CurrentRoundCard from "./round-card/current-round-card";
import ExpiredRoundCard from "./round-card/expired-round-card";

const PositionPad = ({
  currentPrice,
  cardId,
  setCardId,
}: {
  currentPrice: number;
  cardId: number;
  setCardId: (id: number) => void;
}) => {
  let renderCard;

  switch (cardId) {
    case -1:
      renderCard = <ExpiredRoundCard />;
      break;
    case 0:
      renderCard = <CurrentRoundCard setCardId={setCardId} />;
      break;
    case 1:
      renderCard = <StartRoundCard />;
      break;
    default:
      renderCard = <StartRoundCard cardId={cardId} />;
      break;
  }

  return (
    <div className="mx-auto w-full max-w-360 2xl:max-w-450 relative h-490 xl:h-550 hidden md:block">
      {renderCard}
    </div>
  );
};

export default PositionPad;
