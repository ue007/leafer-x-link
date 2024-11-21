import { Leafer, Group, Rect, Ellipse, Box, Text } from 'leafer-ui'
import { LeaferXQnConnector, IConnectorOption } from "./src/index";
const leafer = new Leafer({ view: window })

const box2 = new Box({
    x: 0,
    y: 0,
    // width: 100,
    // height: 100,
    fill: "rgba(100,0,0,0.0)",
    cornerRadius: 20,
    overflow: "hide",
    children: [
        {
            tag: 'Text',
            // width: 100,
            // height: 100,
            text: 'Link',
            fill: 'black',
            padding: [0, 0],
            textAlign: "center",
            verticalAlign: "middle",
        },
    ],
    draggable: true,
});
leafer.add(box2);
box2.zIndex = 2;

const elipse = new Box({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: '#cdcdcd',
    draggable: true,
    stroke: '#000000',
    strokeWidth: 1,
    children: [
        {
            tag: 'Text',
            width: 100,
            height: 100,
            text: 'From Node',
            fill: 'black',
            padding: [0, 0],
            textAlign: "center",
            verticalAlign: "middle",
        },
    ],
});

const rect = new Box({
    x: 400,
    y: 400,
    width: 100,
    height: 100,
    fill: '#cdcdcd',
    draggable: true,
    stroke: '#000000',
    strokeWidth: 1,
    children: [
        {
            tag: 'Text',
            width: 100,
            height: 100,
            text: 'To Node',
            fill: 'black',
            padding: [0, 0],
            textAlign: "center",
            verticalAlign: "middle",
        },
    ],
});

const opt: IConnectorOption = {
    opt1: {
        // side: 'b',
        arrow: 'square',
        // margin:25,
    },
    opt2: {
        // side: 't',
        // percent: 0.8,
        arrow: 'triangle',
        // margin:5,
    },
    padding: 20,
    // margin:10,
    etc: {
        // text,
        leafer
    },
    onDraw: (param) => {
        console.log(`param::`, param)
        const startP = param.s.linkPoint;
        const endP = param.e.linkPoint;
        const centerP = { x: (startP.x + endP.x) / 2, y: (startP.y + endP.y) / 2 };
        box2.x = centerP.x - box2.width/2;
        box2.y = centerP.y - box2.height/2;
        // console.log(centerP);
        // box2.x = centerP.x ;
        // box2.y = centerP.y ;
        return param.path;
    }
}

const conn = new LeaferXQnConnector(elipse, rect, opt);
conn.name = "link";
console.log(conn)

const group = new Group({
    x: 0,
    y: 0
})

group.add(rect);
group.add(elipse);
leafer.add(group);
group.add(conn);

console.log(leafer)