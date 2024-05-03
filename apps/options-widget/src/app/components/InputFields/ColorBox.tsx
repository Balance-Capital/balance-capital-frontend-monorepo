import { ChangeEvent, memo } from "react";

interface IProps {
  name: string;
  id: string;
  value: string;
  onChangeHandler: (e: ChangeEvent<HTMLInputElement>) => void;
}

function Colorbox({ name, id, value, onChangeHandler }: IProps) {
  return (
    <input
      onChange={onChangeHandler}
      className="colorInput w-8 h-6 bg-transparent rounded-lg border-2 border-darkgreen-1"
      type="color"
      value={value}
      id={id}
      name={name}
    />
  );
}

export default memo(Colorbox);
