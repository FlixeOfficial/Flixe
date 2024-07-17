// import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

import authOptions from "@/app/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

interface Session {
  user?: {
    email: string;
  };
}

const FlixsPage = async () => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return redirect("/");
  }

  const flixs = await db.flix.findMany({
    where: {
      userId: {
        equals: session.user.email.toLowerCase(),
        mode: 'insensitive',
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6">
      <DataTable columns={columns} data={flixs} />
    </div>
  );
};

export default FlixsPage;
