
import { Outlet } from "react-router-dom";
import UserSidebar from "../../components/UserSidebar";
import UserTopbar from "../../components/UserTopbar";

export default function UserLayout(){

  return(

    <div
      className="
      flex
      h-screen
      bg-gradient-to-r
      from-slate-900
      to-[#0b1b34]
      text-white
      "
    >

      <UserSidebar/>

      <div className="flex-1 flex flex-col">

        <UserTopbar/>

        <main
          className="
          flex-1
          p-8
          overflow-y-auto
          "
        >

          <Outlet/>

        </main>

      </div>

    </div>

  );

}
