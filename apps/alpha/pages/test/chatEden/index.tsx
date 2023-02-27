/* eslint-disable react-hooks/rules-of-hooks */
import { gql, useMutation, useQuery } from "@apollo/client";
import { UserContext } from "@eden/package-context";
import { FIND_MEMBER_INFO, MATCH_NODES_MEMBERS } from "@eden/package-graphql";
import {
  MatchMembersToSkillOutput,
  MatchPercentage,
  Members,
  Project,
  RoleType,
} from "@eden/package-graphql/generated";
import {
  AvatarList,
  Badge,
  Button,
  Card,
  CardGrid,
  ChatSimple,
  CommonServerAvatarList,
  LongText,
  MemberInfo,
  SendMessageUserToUser,
  SocialMediaComp,
  TextHeading3,
  TextLabel1,
  // GridItemNine,
  // GridLayout,
  UserInviteModal,
  UserWithDescription,
} from "@eden/package-ui";
import dynamic from "next/dynamic";
import React, { Fragment, useContext, useEffect, useState } from "react";

import type { NextPageWithLayout } from "../../_app";

const GraphVisual = dynamic(
  () => import("@eden/package-ui/g6/GraphVisual/GraphVisual"),
  {
    ssr: false,
  }
);

const EDEN_GPT_REPLY = gql`
  query ($fields: edenGPTreplyInput!) {
    edenGPTreply(fields: $fields) {
      reply
      keywords
    }
  }
`;

const FIND_NODES_NAME = gql`
  query ($fields: findNodesInput!) {
    findNodes(fields: $fields) {
      _id
      name
      node
    }
  }
`;

const nodesExample = {
  nodes: [
    {
      id: "node0",
      size: 80,
      x: 5,
      y: 5,
      label: "eloi",
      // ----------- Shwow Avatar User ---------
      type: "image",
      img: "https://cdn.discordapp.com/avatars/961730944170090516/e5844ca759a74e995027a0e50c5cb1bf.png",
      clipCfg: {
        show: true,
        type: "circle",
        r: 25,
      },
      style: {
        height: 50,
        width: 50,
      },
      // ----------- Shwow Avatar User ---------
    },
  ],
  edges: [],
};

const chatEden: NextPageWithLayout = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [messageUser, setMessageUser] = useState<string>("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [edenAIsentMessage, setEdenAIsentMessage] = useState<boolean>(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [keywordsDiscussion, setKeywordsDiscussion] = useState<any>([]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [nodesN, setNodesN] = useState<any>(nodesExample);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { selectedServerID } = useContext(UserContext);

  // const [nodesID] = useState<string[] | null>(null);
  const [nodesID, setNodesID] = useState<string[] | null>(null);

  // const [nodeNames]

  const { data: dataFindNodesName } = useQuery(FIND_NODES_NAME, {
    variables: {
      fields: {
        // Continue here with -> keywordsDiscussion
        names: keywordsDiscussion,
        // names: [
        //   'Design User Interfaces', 'UX/UI Design'
        // ],
      },
    },
    skip: keywordsDiscussion.length == 0,
    context: { serviceName: "soilservice" },
  });

  console.log("dataFindNodesName = ", dataFindNodesName);
  console.log("keywordsDiscussion = ", keywordsDiscussion);

  const { data: dataEdenGPTReply } = useQuery(EDEN_GPT_REPLY, {
    variables: {
      fields: {
        message: messageUser,
      },
    },
    skip: messageUser == "",
    context: { serviceName: "soilservice" },
  });

  const { data: dataMembers } = useQuery(MATCH_NODES_MEMBERS, {
    variables: {
      fields: {
        // nodesID: nodesID,
        // nodesID: ["63eaefc44862b62edc3037b4"],
        nodesID: ["63eaefb14862b62edc303768", "63eaefc44862b62edc3037b4"],
        serverID: selectedServerID,
      },
    },
    // skip: !nodesID || !selectedServerID,
    context: { serviceName: "soilservice" },
  });

  console.log("dataMembers = ", dataMembers);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [chatN, setChatN] = useState([
    {
      user: "01",
      message: "Hey I am Eden AI, how can I help you?",
    },
  ]);

  const mergeUniqueKeywords = (arr1: any, arr2: any) => {
    const uniqueKeywords = new Set([...arr1, ...arr2]);

    // const newKeywords = Array.from(arr2.filter(keyword => !uniqueKeywords.has(keyword)));
    const newKeywords = arr2.filter((keyword: any) => !arr1.includes(keyword));

    const nodesNew = [...nodesN.nodes];

    const edgesNew = [...nodesN.edges];

    newKeywords.forEach((keyword: any) => {
      if (keyword != "") {
        nodesNew.push({
          id: keyword,
          label: keyword,
          size: 40,
        });
        edgesNew.push({
          source: "node0",
          target: keyword,
        });
      }
    });

    setNodesN({
      nodes: nodesNew,
      edges: edgesNew,
    });

    const mergeUniqueK = Array.from(uniqueKeywords);

    const mergeUniqueKNew = [];

    for (let i = 0; i < mergeUniqueK.length; i++) {
      if (mergeUniqueK[i] !== "") {
        mergeUniqueKNew.push(mergeUniqueK[i]);
      }
    }

    // console.log(mergeUniqueKNew);

    return mergeUniqueKNew;
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (dataEdenGPTReply && edenAIsentMessage == true) {
      const chatT = [...chatN];

      chatT.push({
        user: "01",
        message: dataEdenGPTReply.edenGPTreply.reply,
      });
      setChatN(chatT);

      setEdenAIsentMessage(false);

      // if the dataEdenGPTReply.edenGPTreply.keywords are new then add them to keywordsDiscussion

      const keywordsAI = dataEdenGPTReply.edenGPTreply.keywords;

      const newKeywords = mergeUniqueKeywords(keywordsDiscussion, keywordsAI);

      if (keywordsAI.length > 0) {
        setKeywordsDiscussion(newKeywords);
      }
    }
  }, [dataEdenGPTReply]);

  useEffect(() => {
    if (dataFindNodesName?.findNodes?.length > 0) {
      const newNodesID: any = [];

      dataFindNodesName.findNodes.map((nodes: any) => {
        console.log("nodes = ", nodes);

        newNodesID.push(nodes._id);
      });

      setNodesID(newNodesID);
    }
  }, [dataFindNodesName]);

  console.log("nodesID = ", nodesID);

  // console.log("keywordsDiscussion =--------- ", keywordsDiscussion);

  const handleSentMessage = (messageN: any, userN: any) => {
    const chatT = [...chatN];

    chatT.push({
      user: userN,
      message: messageN,
    });
    setChatN(chatT);

    console.log("messageN ==------- ", messageN);

    setMessageUser(messageN);

    setEdenAIsentMessage(true);

    // console.log("handleSentMessage = ", chatT);
  };

  console.log("messageUser = ", messageUser);

  // console.log("dataEdenGPTReply = ", dataEdenGPTReply);

  //   return ( <div className="h-full flex flex-col justify-between">
  //   <div className="p-4 bg-white h-full overflow-y-auto">
  //     <p className="text-lg font-bold">Message Title</p>
  //     <div className="my-4">
  //       <p>Message 1</p>
  //       <p>Message 2</p>
  //       <p>Message 3</p>
  //     </div>
  //   </div>
  //   <div className="p-4 bg-white flex justify-between items-center">
  //     <input type="text" className="w-full mr-4 py-2 px-4 rounded border border-gray-400" placeholder="Type your message here..."/>
  //     <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Send</button>
  //   </div>
  // </div>)

  // return (
  //   <>
  //   <div className="flex h-screen">

  //     <div className="w-1/2 h-1/2 bg-gray-200">
  //       <div className="h-full flex flex-col justify-between">
  //         <div className="p-4 bg-white h-full overflow-y-auto">
  //           <p className="text-lg font-bold">Message Title</p>
  //           <div className="my-4">
  //             <p>Message 1</p>
  //             <p>Message 2</p>
  //             <p>Message 3</p>
  //           </div>
  //         </div>
  //         <div className="p-4 bg-white flex justify-between items-center">
  //           <input type="text" className="w-full mr-4 py-2 px-4 rounded border border-gray-400" placeholder="Type your message here..."/>
  //           <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Send</button>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="w-1/2 h-1/2 bg-gray-300"></div>

  //     <div className="w-1/2 h-screen bg-gray-400"></div>

  //     </div>

  //   </>
  // )

  // return (<>
  //   <div className="flex flex-wrap h-screen">

  //       <div className="w-1/2 h-1/2 bg-gray-200">
  //         <div className="h-full flex flex-col justify-between">
  //           <div className="p-4 bg-white h-full overflow-y-auto">
  //             <p className="text-lg font-bold">Message Title</p>
  //             <div className="my-4">
  //               <p>Message 1</p>
  //               <p>Message 2</p>
  //               <p>Message 3</p>
  //             </div>
  //           </div>
  //           <div className="p-4 bg-white flex justify-between items-center">
  //             <input type="text" className="w-full mr-4 py-2 px-4 rounded border border-gray-400" placeholder="Type your message here..."/>
  //             <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Send</button>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="w-1/2 h-full bg-gray-300">X1</div>
  //       <div className="w-1/2 h-1/2 bg-gray-400">Y2</div>

  //     </div>

  // </>)

  // return (
  //   <>
  //           <ChatSimple chatN={chatN} handleSentMessage={handleSentMessage} />
  //   </>
  // )

  return (
    <>
      <div className="flex h-screen">
        <div className="flex flex-1 flex-col">
          <div className="h-1/2 bg-gray-100">
            <ChatSimple chatN={chatN} handleSentMessage={handleSentMessage} />
          </div>
          <div className="h-1/2 bg-gray-50">
            {nodesExample &&
            nodesExample.nodes &&
            nodesExample.nodes.length > 0 ? (
              <GraphVisual data2={nodesN} width={500} height={500} />
            ) : (
              <p>Dont have Graph Data Yet</p>
            )}
          </div>
        </div>
        <div className="h-full flex-1 ">
          {/* <GridLayout> */}
          {/* <GridItemNine> */}
          <Card
            shadow
            className="scrollbar-hide h-full overflow-scroll bg-white p-4"
          >
            <CardGrid>
              {dataMembers?.matchNodesToMembers?.map(
                (member: MatchMembersToSkillOutput, index: number) => (
                  <UserDiscoverCard
                    key={index}
                    matchMember={member}
                    // role={selectedRole}
                    // project={dataProject?.findProject}
                    invite
                    phase={``}
                  />
                )
              )}
            </CardGrid>
          </Card>
          {/* </GridItemNine> */}
          {/* </GridLayout> */}
        </div>
      </div>
    </>
  );

  // return (
  //   <>
  //     {/* <div className="flex h-screen">
  //       <div className="w-1/2 ">
  //         <ChatSimple chatN={chatN} handleSentMessage={handleSentMessage} />
  //       </div>
  //       <div className="w-1/2">
  //         {nodesExample &&
  //         nodesExample.nodes &&
  //         nodesExample.nodes.length > 0 ? (
  //           <GraphVisual data2={nodesN} width={500} height={500} />
  //         ) : (
  //           <p>Dont have Graph Data Yet</p>
  //         )}
  //       </div>
  //     </div> */}
  //     <div className="flex h-screen">
  //       <div className="flex flex-1 flex-col">
  //         <div className="h-1/2 bg-gray-100">
  //           <ChatSimple chatN={chatN} handleSentMessage={handleSentMessage} />
  //         </div>
  //         <div className="h-1/2 bg-gray-200">
  //           T
  //           {/* {nodesExample &&
  //           nodesExample.nodes &&
  //           nodesExample.nodes.length > 0 ? (
  //             <GraphVisual data2={nodesN} width={500} height={500} />
  //           ) : (
  //             <p>Dont have Graph Data Yet</p>
  //           )} */}
  //         </div>
  //       </div>
  //       <div className="h-full flex-1 bg-gray-400">Z</div>
  //     </div>
  //   </>
  // );
};

export default chatEden;

// ---------------- FROM HERE, ELOI'S MESS UwU ------------------

import { round } from "@eden/package-ui/utils";
import { Maybe } from "graphql/jsutils/Maybe";
import { IncomingMessage, ServerResponse } from "http";
import { getSession } from "next-auth/react";

export async function getServerSideProps(ctx: {
  req: IncomingMessage;
  res: ServerResponse;
}) {
  const session = await getSession(ctx);

  const url = ctx.req.url?.replace("/", "");

  if (!session || session.error === "RefreshAccessTokenError") {
    return {
      redirect: {
        destination: `/login?redirect=${url}`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const EDEN_GPT_PROFILES = gql`
  query EdenGPTsearchProfiles($fields: edenGPTsearchProfilesInput) {
    edenGPTsearchProfiles(fields: $fields) {
      reply
    }
  }
`;

// const nodesExample = {
//   nodes: [
//     {
//       id: "node0",
//       size: 80,
//       x: 5,
//       y: 5,
//       label: "eloi",
//       // ----------- Shwow Avatar User ---------
//       type: "image",
//       img: "https://cdn.discordapp.com/avatars/961730944170090516/e5844ca759a74e995027a0e50c5cb1bf.png",
//       clipCfg: {
//         show: true,
//         type: "circle",
//         r: 25,
//       },
//       style: {
//         height: 50,
//         width: 50,
//       },
//       // ----------- Shwow Avatar User ---------
//     },
//   ],
//   edges: [],
// };

export interface IUserDiscoverCardProps {
  matchMember?: Maybe<MatchMembersToSkillOutput>;
  project?: Maybe<Project>;
  role?: Maybe<RoleType>;
  invite?: boolean;
  messageUser?: boolean;
  phase?: string;
}

const UserDiscoverCard = ({
  matchMember,
  project,
  role,
  invite,
  phase,
}: IUserDiscoverCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const member = matchMember?.member;
  const matchPercentage = matchMember?.matchPercentage;
  const nodesPercentage = matchMember?.nodesPercentage;

  if (!member) return null;

  return (
    <Card border>
      <div className={`flex justify-center`}>
        <div>
          <div className={`relative flex flex-col items-center`}>
            <UserWithDescription
              member={member}
              percentage={round(Number(matchPercentage?.totalPercentage), 0)}
            />
            {member?.links && (
              <div className="flex justify-center">
                <SocialMediaComp size="sm" title="" links={member?.links} />
              </div>
            )}
          </div>
        </div>
        <div className="absolute right-2 top-2">
          <Button onClick={() => setIsOpen(!isOpen)}>More</Button>
        </div>
      </div>

      <div className="flex">
        <LongText
          cutText={100}
          text={(member?.bio as string) || ""}
          className={`text-darkGreen font-Inter my-2 text-sm`}
        />
      </div>

      {member?.serverID && (
        <CommonServerAvatarList
          label={`common servers`}
          size={`xs`}
          serverID={member?.serverID as string[]}
        />
      )}

      {nodesPercentage && (
        <div>
          <p className="font-Inter mb-1 text-sm font-bold text-zinc-500">
            🛠 Top skills
          </p>
          <div>
            {nodesPercentage.slice(0, 6).map((node, index) => (
              <Badge
                text={node?.node?.name || ""}
                key={index}
                className={`bg-soilPurple/20 py-px text-xs`}
              />
            ))}
          </div>
        </div>
      )}

      {member?.endorsements && member?.endorsements.length > 0 && (
        <div className="mt-4">
          <TextLabel1>🎙 ENDORSEMENTS</TextLabel1>
          <div className={`flex`}>
            <AvatarList
              className="inline-block !w-auto !justify-start"
              avatars={member?.endorsements
                .slice(0, 5)
                .map((endorsement: any) => ({
                  size: "xs",
                  src: endorsement?.endorser?.discordAvatar,
                }))}
            />
            {member?.endorsements.slice(5).length > 0 && (
              <p className="text-soilGray ml-6 mt-1 inline">
                +{member?.endorsements.slice(8).length} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* {(item.lifetimeStakeTRST || item.totalTRST) && (
        <div className="-mx-2 mt-3 -mb-3 flex">
          {item.lifetimeStakeTRST && (
            <LifetimeTRST
              member={item}
              lifetimeStakeTRST={item?.lifetimeStakeTRST}
              averageMonthlyReturnTRST={
                Math.round((item?.lifetimeStakeTRST / 100) * 10) / 10
              }
            />
          )}
          {item.totalTRST && (
            <div className="bg-soilPurple ml-auto mr-0 whitespace-nowrap rounded-xl px-2 text-sm text-white">{`${item.totalTRST} $TRST`}</div>
          )}
        </div>
      )} */}

      {invite && project && role ? (
        <UserInviteModal
          open={isOpen}
          member={member}
          project={project}
          role={role}
          phase={phase}
          matchPercentage={matchPercentage}
          onClose={() => setIsOpen(!isOpen)}
        />
      ) : (
        <>
          <UserMessageModal
            open={isOpen}
            member={member}
            matchPercentage={matchPercentage}
            onClose={() => setIsOpen(!isOpen)}
          />
        </>
      )}
    </Card>
  );
};

import { toast } from "react-toastify";

const SET_APPLY_TO_PROJECT = gql`
  mutation ($fields: changeTeamMember_Phase_ProjectInput!) {
    changeTeamMember_Phase_Project(fields: $fields) {
      _id
    }
  }
`;

export interface IUserMessageModalProps {
  member?: Members;
  matchPercentage?: Maybe<MatchPercentage>;
  open?: boolean;
  onClose?: () => void;
}

const UserMessageModal = ({
  member,
  matchPercentage,
  open,
  onClose,
}: IUserMessageModalProps) => {
  const { data: dataMemberInfo } = useQuery(FIND_MEMBER_INFO, {
    variables: {
      fields: {
        _id: member?._id,
      },
    },
    skip: !member?._id || !open,
  });

  const findMember = dataMemberInfo?.findMember;
  const [showMessage, setShowMessage] = useState(false);

  const [changeTeamMemberPhaseProject, {}] = useMutation(SET_APPLY_TO_PROJECT, {
    onCompleted: () => {
      console.log(changeTeamMemberPhaseProject);
      toast.success("success");
      onClose && onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const [chatN, setChatN] = useState([
    {
      user: "01",
      message: `Do you have any questions about ${member?.discordName}?`,
    },
  ]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [messageUser, setMessageUser] = useState<string>("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [edenAIsentMessage, setEdenAIsentMessage] = useState<boolean>(false);

  // const [keywordsDiscussion, setKeywordsDiscussion] = useState<any>([]);

  // const [nodesN, setNodesN] = useState<any>(nodesExample);

  const handleSentMessage = (messageN: any, userN: any) => {
    const chatT = [...chatN];

    chatT.push({
      user: userN,
      message: messageN,
    });
    setChatN(chatT);

    console.log("messageN ==------- ", messageN);

    setMessageUser(messageN);

    // eslint-disable-next-line react-hooks/rules-of-hooks

    setEdenAIsentMessage(true);

    // console.log("handleSentMessage = ", chatT);
  };

  // const mergeUniqueKeywords = (arr1: any, arr2: any) => {
  //   const uniqueKeywords = new Set([...arr1, ...arr2]);

  // const newKeywords = Array.from(arr2.filter(keyword => !uniqueKeywords.has(keyword)));
  // const newKeywords = arr2.filter((keyword: any) => !arr1.includes(keyword));

  // const nodesNew = [...nodesN.nodes];

  // const edgesNew = [...nodesN.edges];

  // newKeywords.forEach((keyword: any) => {
  //   if (keyword != "") {
  //     nodesNew.push({
  //       id: keyword,
  //       label: keyword,
  //       size: 40,
  //     });
  //     edgesNew.push({
  //       source: "node0",
  //       target: keyword,
  //     });
  //   }
  // });

  // setNodesN({
  //   nodes: nodesNew,
  //   edges: edgesNew,
  // });

  // const mergeUniqueK = Array.from(uniqueKeywords);

  // const mergeUniqueKNew = [];

  // for (let i = 0; i < mergeUniqueK.length; i++) {
  //   if (mergeUniqueK[i] !== "") {
  //     mergeUniqueKNew.push(mergeUniqueK[i]);
  //   }
  // }

  // console.log(mergeUniqueKNew);

  //   return mergeUniqueKNew;
  // };

  const { data: dataEdenGPTReply } = useQuery(EDEN_GPT_PROFILES, {
    variables: {
      fields: {
        message: messageUser,
        profileIDs: [member?._id],
      },
    },
    skip: messageUser == "",
    context: { serviceName: "soilservice" },
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (dataEdenGPTReply && edenAIsentMessage == true) {
      const chatT = [...chatN];

      chatT.push({
        user: "01",
        message: dataEdenGPTReply.edenGPTsearchProfiles.reply,
      });
      setChatN(chatT);

      setEdenAIsentMessage(false);

      // if the dataEdenGPTReply.edenGPTreply.keywords are new then add them to keywordsDiscussion

      // const keywordsAI = dataEdenGPTReply.edenGPTsearchProfiles.keywords;

      // const newKeywords = mergeUniqueKeywords(keywordsDiscussion, keywordsAI);

      // if (keywordsAI.length > 0) {
      //   setKeywordsDiscussion(newKeywords);
      // }
    }
  }, [dataEdenGPTReply]);
  if (!member) return null;
  // if (!findMember) return null;

  return (
    <ChatModal open={open} onClose={onClose}>
      {open && (
        <div
          className="fixed -right-[340px] z-50 bg-white w-[300px] h-8/10 bottom-0 rounded-lg"
          onClick={(e) => {
            console.log("this event :)");

            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ChatSimple chatN={chatN} handleSentMessage={handleSentMessage} />
        </div>
      )}
      <div className={`h-8/10 scrollbar-hide w-full overflow-scroll`}>
        <div className={`mt-4 grid grid-cols-5`}>
          <div className={`col-span-2 flex justify-end`}></div>
          <div className={`col-span-1 h-8`}></div>
          <div className={`col-span-2`}>
            {!showMessage && (
              <Button onClick={() => setShowMessage(!showMessage)}>
                Connect with {member?.discordName}
              </Button>
            )}
            {showMessage && (
              <Button onClick={() => setShowMessage(!showMessage)}>
                Cancel Message
              </Button>
            )}
          </div>
        </div>
        <div className={`-mt-12`}>
          {showMessage ? (
            <div>
              <div>
                <UserWithDescription
                  member={member}
                  percentage={matchPercentage?.totalPercentage || undefined}
                />
              </div>
              <div className={`my-4`}>
                <TextHeading3 className={`text-md text-gray-500`}>
                  Start a converstation with @{member?.discordName}.
                </TextHeading3>
              </div>
              <SendMessageUserToUser member={member} />
            </div>
          ) : (
            <MemberInfo
              member={findMember || member}
              percentage={matchPercentage?.totalPercentage || undefined}
            />
          )}
        </div>
      </div>
    </ChatModal>
  );
};

import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

export type ChatModalProps = {
  title?: string;
  children?: React.ReactNode;
  open?: boolean;
  closeOnEsc?: boolean;
  onClose?: () => void;
};

const ChatModal = ({
  title = "",
  children,
  open = false,
  closeOnEsc = true,
  onClose,
}: ChatModalProps) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const onCloseModal = () => {
    if (onClose) onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className={"fixed inset-0 z-10 overflow-y-auto"}
        onClose={() => {
          if (onClose) {
            onCloseModal();
          }
          if (closeOnEsc) setIsOpen(false);
          onClose && onClose();
        }}
      >
        <div
          className={
            "flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
          }
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay
              className={
                "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              }
            />
          </Transition.Child>
          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className={"hidden sm:inline-block sm:h-screen sm:align-middle"}
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={
                "relative z-30 inline-block rounded-lg bg-white p-2 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6 sm:align-middle"
              }
            >
              <div
                className={"absolute top-0 right-0 hidden pt-4 pr-4 sm:block"}
              >
                {closeOnEsc && (
                  <button
                    type="button"
                    className={
                      "rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    }
                    onClick={() => {
                      setIsOpen(false);
                      onClose && onClose();
                    }}
                  >
                    <span className={"sr-only"}>Close</span>
                    <XIcon className={"h-6 w-6"} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className={"sm:flex"}>
                <div className={"mt-3 w-full sm:mt-0"}>
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 text-gray-900 ${
                      closeOnEsc ? "mr-12" : ""
                    }`}
                  >
                    {title}
                  </Dialog.Title>
                  <div className={"mt-2"}>{children}</div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
