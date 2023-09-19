import { React, useState, useRef } from "react";
import { ResizableBox } from "react-resizable";
import CodeMirror from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import { sql } from "@codemirror/lang-sql";
import { tags as t } from "@lezer/highlight";
import Shape from "./shape";
// import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import { Parser } from "node-sql-parser";
import { Tabs } from "@douyinfe/semi-ui";
import "react-resizable/css/styles.css";
import TableOverview from "./table_overview";
import ReferenceOverview from "./reference_overview";
import { defaultTableTheme } from "../data/data";
import { ImagePreview, Image } from "@douyinfe/semi-ui";

const myTheme = createTheme({
  dark: "light",
  settings: {},
  styles: [
    { tag: t.comment, color: "#8ab0ed" },
    { tag: t.string, color: "#e68e29" },
    { tag: t.number, color: "#e68e29" },
    { tag: t.keyword, color: "#295be6" },
    { tag: t.variableName, color: "#1a00db" },
    { tag: t.typeName, color: "#295be6" },
    { tag: t.tagName, color: "#008a02" },
  ],
});

const EditorPanel = (props) => {
  const [tab, setTab] = useState("1");
  const map = useRef(new Map());

  const [visible1, setVisible1] = useState(false);
  const [dataUrl, setDataUrl] = useState("");

  const visibleChange1 = (v) => {
    setVisible1(v);
  };

  const tabList = [
    { tab: "Tables", itemKey: "1" },
    { tab: "References", itemKey: "2" },
    { tab: "Shapes", itemKey: "3" },
    { tab: "Editor", itemKey: "4" },
  ];
  const contentList = [
    <div>
      <TableOverview tables={props.tables} setTables={props.setTables} />
    </div>,
    <div>
      <ReferenceOverview
        relationships={props.relationships}
        setRelationships={props.setRelationships}
        tables={props.tables}
      />
    </div>,
    <div>
      <Shape />
    </div>,
    <div>
      <CodeMirror
        value={props.code}
        height="100%"
        theme={myTheme}
        extensions={[sql()]}
        onChange={(e) => {
          props.setCode(e);
        }}
      />
    </div>,
  ];

  return (
    <ResizableBox
      className="shadow-xl"
      width={window.innerWidth * 0.23}
      height={window.innerHeight}
      resizeHandles={["e"]}
      minConstraints={[window.innerWidth * 0.23, window.innerHeight]}
      maxConstraints={[Infinity, Infinity]}
      axis="x"
    >
      <div className="overflow-auto h-full mt-2">
        <Tabs
          type="card"
          tabList={tabList}
          onChange={(key) => {
            setTab(key);
          }}
        >
          {contentList[parseInt(tab) - 1]}
        </Tabs>

        <button
          onClick={() => {
            const newArea = {
              id: props.areas.length,
              name: `area_${props.areas.length}`,
              x: 0,
              y: 0,
              width: 200,
              height: 200,
              color: defaultTableTheme,
            };
            props.setAreas((prev) => {
              const updatedTables = [...prev, newArea];
              return updatedTables;
            });
          }}
        >
          add area
        </button>
        <br />
        <button
          onClick={() => {
            const blob = new Blob([props.code], {
              type: "text/plain;charset=utf-8",
            });

            window.saveAs(blob, "src.txt");
          }}
        >
          export src
        </button>
        <br />
        <button
          onClick={() => {
            try {
              const parser = new Parser();
              const ast = parser.astify(props.code);
              console.log(ast);
              ast.forEach((e) => {
                e.table.forEach((t) => {
                  if (map.current.has(t.table)) {
                    return;
                  }
                  map.current.set(t.table, t);
                  const newTable = {
                    id: props.tables.length,
                    name: `table_${props.tables.length}`,
                    x: 0,
                    y: 0,
                    fields: [
                      {
                        name: "id",
                        type: "UUID",
                        default: "",
                        check: "",
                        primary: true,
                        unique: true,
                        notNull: true,
                        increment: true,
                        comment: "",
                      },
                    ],
                    comment: "",
                    indices: [],
                    color: defaultTableTheme,
                  };
                  props.setTables((prev) => [...prev, newTable]);
                });
              });
            } catch (e) {
              alert("parsing error");
            }
          }}
        >
          parse
        </button>
        <br />
        <button
          onClick={() => {
            toPng(document.getElementById("canvas")).then(function (dataUrl) {
              // window.saveAs(dataUrl, "canvas.png");
              setDataUrl(dataUrl);
            });
            setVisible1(true);
          }}
        >
          export img
        </button>
        <ImagePreview
          src={dataUrl}
          visible={visible1}
          onVisibleChange={visibleChange1}
        >
          <div>
            {visible1&&<Image
              src={"https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg"}
              width={200}
              alt={`lamp${1}`}
              
              style={{ marginRight: 5 }}
            />}
          </div>
        </ImagePreview>
      </div>
    </ResizableBox>
  );
};

export default EditorPanel;
