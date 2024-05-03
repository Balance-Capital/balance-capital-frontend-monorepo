import React from "react";

function Header() {
  return (
    <div className="xs:flex flex-col items-center sm:block xs:px-20 sm:px-40 py-20 xs:mt-10 bg-cover bg-center sm:bg-transparent lg:bg-[url('./assets/images/bg-reward-lg.png')] bg-no-repeat rounded-2xl border-obsidianBlack xs:border-0 lg:border-2">
      <p className="xs:text-34 sm:text-40 text-textWhite xs:text-center lg:text-left">
        Ryze Rewards
      </p>
      <p className="xs:text-18 sm:text-22 text-second xs:text-center lg:text-left">
        Earn reward points
      </p>
    </div>
  );
}

export default Header;
