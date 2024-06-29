import { Flex } from "@mantine/core";
import { ISetting } from "@pm2.web/typings";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";

import { SelectedProvider, useSelected } from "@/components/context/SelectedProvider";
import { Dashboard } from "@/components/layouts/Dashboard";
import ProcessItem from "@/components/process/ProcessItem";
import { getServerSideHelpers } from "@/server/helpers";
import { trpc } from "@/utils/trpc";

function Process({ settings }: { settings: ISetting }) {
  const { selectedProcesses } = useSelected();

  return (
    <Flex gap="xs" direction={"column"}>
      {selectedProcesses?.map((process) => <ProcessItem process={process} key={process._id} setting={settings} />)}
    </Flex>
  );
}

export default function ProcessPage({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const dashboardQuery = trpc.server.getDashBoardData.useQuery(undefined, {
    refetchInterval: (query) => {
      const data = query.state.data;
      const polling = data?.settings?.polling?.frontend || 0;
      return Math.min(Math.max(polling, 4000), 10_000);
    },
  });
  const data = dashboardQuery.data!;

  if (dashboardQuery.status !== "success") {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>pm2.web</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <SelectedProvider servers={data.servers}>
        <Dashboard>
          <Process settings={data.settings} />
        </Dashboard>
      </SelectedProvider>
    </>
  );
}

export async function getServerSideProps() {
  const helpers = await getServerSideHelpers();

  await helpers.server.getDashBoardData.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
