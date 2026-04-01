"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function AgentPage() {
  useEffect(() => {
    redirect("/");
  }, []);

  return null;
}
