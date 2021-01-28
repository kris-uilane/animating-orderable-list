import React, { Component, memo, useRef } from "react";
import ReactDOM from "react-dom";

const Item = ({ handleChange, id, text, setItemRef, size, idx }) => {
  const itemRef = useRef();
  setItemRef(id, itemRef);

  const options = [<option key={"-"}>-</option>];

  for (let i = 0; i < size; i += 1) {
    options.push(
      <option value={i} key={i}>
        {i + 1}
      </option>
    );
  }

  const getHandleChange = () => (e) => {
    const toIdx = Number(e.target.value);
    handleChange(id, toIdx);
  };

  return (
    <div
      key={text}
      ref={itemRef}
      style={{
        border: "1px solid black",
        width: "200px",
        display: "flex",
        position: "absolute",
        top: `${20 * idx}px`
      }}
    >
      <select onChange={getHandleChange()}>{options}</select>
      {text}
    </div>
  );
};

const List = ({ items, result, handleChange, itemsRefs, setItemRef }) => {
  const renderable = items.map(({ text, id }, idx) => {
    return (
      <Item
        key={text}
        handleChange={handleChange}
        id={id}
        text={text}
        idx={idx}
        itemsRefs={itemsRefs}
        setItemRef={setItemRef}
        result={result}
        size={items.length}
      />
    );
  });

  return (
    <div
      style={{
        position: "relative",
        height: `${20 * items.length + 50}px`
      }}
    >
      {renderable}
    </div>
  );
};

const Memoized = memo(List, (prevProps, nextProps) => {
  return true;
});

class App extends Component {
  constructor(props) {
    super(props);

    this.itemsRefs = {};

    this.setItemRef = this.setItemRef.bind(this);
    this.setResult = this.setResult.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      result: Array.from(new Array(props.items.length)).fill(null)
    };
  }

  insert = (id, toIdx, target = this.state.result) => {
    console.log({ id, toIdx, target });
    const tmpList = [...target];

    if (tmpList[toIdx] === null) {
      tmpList[toIdx] = id;
    } else {
      const tmpVal = tmpList[toIdx];
      tmpList[toIdx] = null;
      const sub = this.insert(tmpVal, 0, tmpList.slice(toIdx + 1));
      tmpList.splice(toIdx + 1, sub.length, ...sub);
      tmpList[toIdx] = id;
    }

    return tmpList;
  };

  handleChange = (id, toIdx) => {
    const tmpList = [...this.state.result];
    const insertedTmpList = this.insert(id, toIdx);

    this.props.items.forEach(({ id }, idx) => {
      const ele = this.itemsRefs[id].current;
      const select = ele.querySelector("select");
      const newVal = insertedTmpList.includes(id) ? tmpList.indexOf(id) : "-";
      select.value = newVal;
    });

    this.setResult(insertedTmpList);
  };

  setItemRef(id, ref) {
    this.itemsRefs[id] = ref;
  }

  setResult(result) {
    this.setState({
      result
    });

    const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    Object.values(this.itemsRefs).forEach(
      (item) => (item.current.style.backgroundColor = color)
    );
  }

  render() {
    return (
      <div>
        <Memoized
          items={this.props.items}
          result={this.state.result}
          setResult={this.setResult}
          itemsRefs={this.itemsRefs}
          setItemRef={this.setItemRef}
          handleChange={this.handleChange}
        />
        <pre>{JSON.stringify(this.state.result, null, 2)}</pre>
        <pre>{JSON.stringify(this.props.items, null, 2)}</pre>
      </div>
    );
  }
}

App.defaultProps = {
  items: [
    { text: "red", id: "_RED" },
    { text: "green", id: "_GREEN" },
    { text: "blue", id: "_BLUE" },
    { text: "yellow", id: "_YELLOW" },
    { text: "pink", id: "_PINK" }
  ]
};

ReactDOM.render(<App />, document.getElementById("container"));
