import { ChangeEvent, memo } from "react";

interface IProps {
  name: string;
  id: string;
  handleClick: (e?: ChangeEvent<HTMLInputElement>) => void;
  isChecked: boolean;
}

function CheckBox({ name, id, handleClick, isChecked }: IProps) {
  return (
    <input
      onChange={handleClick}
      className="relative appearance-none w-5 h-5 border-2 border-darkgreen-1 rounded-md checked:bg-greenish-1 checked:border-greenish-3 after:absolute after:left-0 after:top-0 after:h-full after:w-full checked:after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMS4yMTciIGhlaWdodD0iNy45NjEiIHZpZXdCb3g9IjAgMCAxMS4yMTcgNy45NjEiPg0KICA8cGF0aCBpZD0iUGF0aF8zODg3IiBkYXRhLW5hbWU9IlBhdGggMzg4NyIgZD0iTTc3NC4zOTQsNzIuNTc2YS45NDUuOTQ1LDAsMCwxLS42NjYtLjI3NGwtMy4yMi0zLjE4YS45NDguOTQ4LDAsMSwxLDEuMzMyLTEuMzQ5bDIuNTUxLDIuNTIsNS40MzUtNS40YS45NDguOTQ4LDAsMSwxLDEuMzM3LDEuMzQ1bC02LjEsNi4wNjVBLjk0NS45NDUsMCwwLDEsNzc0LjM5NCw3Mi41NzZaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNzcwLjIyNyAtNjQuNjE1KSIgZmlsbD0iI2ZmZiIvPg0KPC9zdmc+DQo=')] after:bg-[length:15px] after:bg-center after:bg-no-repeat after:content-['']"
      type="checkbox"
      name={name}
      checked={isChecked}
      id={id}
    />
  );
}

export default memo(CheckBox);
