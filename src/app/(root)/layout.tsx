import { redirect } from "next/navigation";

export default async function SetupLayout(){
    redirect("/dashboard"); // Remove the return here
}