import { Leafer, Group, Rect, Ellipse, Box, Text } from 'leafer-ui'
import { Link, IConnectorOption } from "./src/index";
const leafer = new Leafer({ view: window })


const centerNode = new Box({
    x: 600,
    y: 400,
    // width: 100,
    // height: 30,
    fill: 'orange',
    draggable: true,
    stroke: '#000000',
    strokeWidth: 1,
    cornerRadius: 20,
    children: [
        {
            tag: 'Text',
            width: 100,
            height: 30,
            text: 'Center Node',
            fill: 'black',
            padding: [0, 0],
            textAlign: "center",
            verticalAlign: "middle",
        },
    ],
});
leafer.add(centerNode);


const opt: IConnectorOption = {
    opt1: {
        side: 'b',
        // arrow: 'square',
        // margin:25,
        padding: 10,
    },
    opt2: {
        side: 't',
        // percent: 0.8,
        arrow: 'triangle',
        // margin:5,
        padding: 10,
    },
    // padding: 100,
    // margin:10,
    etc: {
        // text,
        leafer
    },
    name: "link",
    onDraw: (param) => {
        console.log(`param::`, param)
        const startP = param.s.linkPoint;
        const endP = param.e.linkPoint;
        const centerP = { x: (startP.x + endP.x) / 2, y: (startP.y + endP.y) / 2 };
        const source = param.source;
        const label = source && source.getAttr('label');
        if (label) {
            const bounds = label.boxBounds;
            console.log(bounds);
            label.x = centerP.x - bounds.width / 2;
            label.y = centerP.y - bounds.height / 2;
        }

        return param.path;
    }
}

for (let i = 0; i < 3; i++) {
    const fromNode = new Box({
        x: 300 + i * 300,
        y: 100,
        fill: '#cdcdcd',
        draggable: true,
        stroke: '#000000',
        strokeWidth: 1,
        cornerRadius: 20,
        children: [
            {
                tag: 'Text',
                width: 100,
                height: 30,
                text: 'From Node',
                fill: 'black',
                padding: [0, 0],
                textAlign: "center",
                verticalAlign: "middle",
            },
        ],
    });

    leafer.add(fromNode);

    const label = new Box({
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
    leafer.add(label);
    label.zIndex = 2;

    const link = new Link(fromNode, centerNode, opt);
    link.name = "link";
    link.curve = true;
    link.setAttr('label', label);
    link._generatePath();
    leafer.add(link);

    const toNode = new Box({
        x: 400 + i * 400,
        y: 600,
        // width: 100,
        // height: 30,
        fill: '#cdcdcd',
        draggable: true,
        stroke: '#000000',
        strokeWidth: 1,
        cornerRadius: 20,
        children: [
            {
                tag: 'Text',
                width: 100,
                height: 30,
                text: 'To Node',
                fill: 'black',
                padding: [0, 0],
                textAlign: "center",
                verticalAlign: "middle",
            },
        ],
    });
    leafer.add(toNode);

    const link2 = new Link(centerNode, toNode, opt);
    link2.name = "link2";
    link2.curve = false;
    leafer.add(link2);

    console.log(centerNode)

}



