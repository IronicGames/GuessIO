import { useEffect, useState } from "react";
import "../../../styles/globals.css";
import Button from "../Button";
import TextButton from "../TextButton";
import Logo from "../Logo";
import Login from "./Login";
import { ProfileDropdown } from "./ProfileDropdown";
import { useAuth } from "@/app/providers/auth-provider";

export default function Header() {
    const [username, setUsername] = useState("Guest")
    const [pfp, setpfp] = useState("")
    const {isLoggedIn} = useAuth()

  return (
    <main style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <Logo className="fixed top-0 left-4"/>
        {isLoggedIn ? <ProfileDropdown/> : <Login/>}
    </main>
  );
}