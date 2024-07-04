import { Ping } from "./commands/Ping";
import { Donate } from "./commands/Donate";
import { Codenames } from "./commands/Codenames";
import { Feedback } from "./commands/Feedback";
import { Quote } from "./commands/Quote";
import { QuoteGuesser } from "./commands/QuoteGuesser";
import { Connections } from "./commands/Connections";
import { Settings } from "./commands/Settings";
import { QuoteList } from "./components/QuoteList";
import { QuoteGuesserButton } from "./components/QuoteGuesserButton";
import { FollowMenu } from "./components/FollowMenu";
import { Command, Component } from "./InteractionEssentials";
import { QuoteGuesserAnswer } from "./components/QuoteGuesserAnswer";

export const Commands: Command[] = [Codenames, Feedback, Donate, Ping, Quote, QuoteGuesser, Connections, Settings];

export const Components: Component<any>[] = [QuoteList, QuoteGuesserButton, QuoteGuesserAnswer, FollowMenu];
