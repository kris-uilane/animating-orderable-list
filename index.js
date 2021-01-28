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
        transition: ".3s ease-in-out",
        transform: `translate(0, ${20 * idx}px)`,
        height: "20px"
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

const Memoized = memo(List, () => {
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

  handleChange = (id, toIdx) => {
    const isDefaultIdx = Number.isNaN(toIdx);
    const idx = isDefaultIdx
      ? this.props.items.map(({ id }) => id).indexOf(id)
      : toIdx;

    const insertedTmpList = this.insert(id, idx, isDefaultIdx);
    this.setResult(insertedTmpList);
    setTimeout(() => this.updateDom(id, toIdx), 0);
  };

  insert = (id, toIdx, isDefaultIdx, target = this.state.result) => {
    const tmpList = [...target];
    // console.log({ id, toIdx, isDefaultIdx, target });

    if (tmpList.includes(id)) {
      tmpList[tmpList.indexOf(id)] = null;
    }

    if (!isDefaultIdx) {
      if (tmpList[toIdx] === null) {
        tmpList[toIdx] = id;
      } else if (toIdx < target.length) {
        const tmpVal = tmpList[toIdx];
        const sub = this.insert(tmpVal, 0, undefined, tmpList.slice(toIdx + 1));
        tmpList.splice(toIdx + 1, sub.length, ...sub);
        tmpList[toIdx] = id;
      }
    }

    return tmpList;
  };

  updateDom = () => {
    const { result } = this.state;
    const { items } = this.props;
    let nextNullIdx = result.indexOf(null);

    items.forEach(({ id }) => {
      let newVal;
      let order;
      const ele = this.itemsRefs[id].current;
      const select = ele.querySelector("select");

      if (result.includes(id)) {
        newVal = `${result.indexOf(id)}`;
      } else {
        newVal = "-";
      }

      select.value = newVal;

      if (!Number.isNaN(Number(newVal))) {
        order = Number(newVal);
      } else {
        order = nextNullIdx;
        nextNullIdx =
          nextNullIdx + 1 + result.slice(nextNullIdx + 1).indexOf(null);
        console.log({ id, nextNullIdx });
      }

      ele.style.transform = `translate(0, ${20 * order}px)`;
    });
  };

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
