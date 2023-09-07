const Bubble = (props) => {
  const { data, left } = props;
  const { message_content, time } = data;
  const now = new Date(time);
  const hours = now.getHours();
  const minutes = now.getMinutes();

  return (
    <li
      className="dialog message-content"
      style={{
        justifyContent: left ? "flex-start" : "flex-end",
      }}>
      <h1 className="message-content">
        {message_content}{" "}
        <span className="message-time">
          {hours}:{minutes} … {now.getDate()}/{now.getMonth()}
        </span>
      </h1>
    </li>
  );
};

export default Bubble;
//selecteduser === data.sender ? "felx-start" : "flex-end",
