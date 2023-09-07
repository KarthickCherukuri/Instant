const Suggestions = (props) => {
  const { data, addingFriend, getTxt } = props;
  const { name, socket_id } = data;

  const clickHandler = () => {
    addingFriend(data);
    getTxt(data.email);
  };

  return (
    <li className="suggestions-list">
      <button style={{ backgroundColor: "transparent" }} onClick={clickHandler}>
        <p
          className="suggestion-p"
          style={{ color: socket_id === null ? "red" : "green" }}>
          {name}
        </p>
      </button>
    </li>
  );
};

export default Suggestions;
