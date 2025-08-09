import { redirect } from "next/navigation";

export default async function SetupLayout(){
    redirect("/home"); // Remove the return here
}