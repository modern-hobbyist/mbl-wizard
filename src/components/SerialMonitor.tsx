import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {useAppDispatch, useAppSelector} from "../hooks";
import {Button, Typography} from "@mui/material";
import {clearSerialHistory} from "../actions/adminActions";

export function SerialMonitor() {
    const dispatch = useAppDispatch();
    const serialHistory = JSON.parse(useAppSelector(state => state.root.adminState.serialHistory))
    const connectedToPort = useAppSelector(state => state.root.adminState.connectedToPort)
    //TODO clear history

    const messagesEndRef = React.useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
    }

    const printedHistory = [];
    let index = 0;

    for (const message of serialHistory) {
        const lineItems = [];
        if (!message.send) {
            for (const line of message.message.split(/(?:\r\n|\r|\n)/g)) {
                lineItems.push(
                    <Typography fontSize="x-small" sx={{ml: 2}} key={`message-${index}`}>
                        {line}
                    </Typography>
                )
                index++;
            }
        }
        printedHistory.push(
            <Typography fontSize="x-small" fontWeight={message.send ? "bolder" : "inherit"} key={`message-${index}`}>
                {message.send ? `Sent: ${message.message}` : "Recv:"}
            </Typography>,
            lineItems
        );
        index++;
    }

    printedHistory.push(
        <div ref={messagesEndRef} key="reference"></div>
    );

    React.useEffect(() => {
        scrollToBottom()
    }, [printedHistory]);

    const card = (
        <React.Fragment>
            <CardContent>
                <Button disabled={!connectedToPort} key="clear-button"
                        sx={{position: "fixed", top: 10, right: 10}}
                        onClick={clearSerialHistory}
                >Clear</Button>
                {/*    TODO Build out the serial history and make is scrollable*/}
                {printedHistory}
            </CardContent>
        </React.Fragment>
    );

    return (
        <Box sx={{height: "100%", m: 0}}>
            <Card variant="outlined" sx={{height: "100%", overflowY: "scroll"}}>{card}</Card>
        </Box>
    );
}

export default SerialMonitor;
