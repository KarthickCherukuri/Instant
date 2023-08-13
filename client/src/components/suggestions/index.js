import "./index.css";

const Suggestions = (props) => {
  const { data } = props;

  const { name, email, picture } = data;
  return (
    <li className="suggestions-list">
      <p className="suggestion-p">{name}</p>
    </li>
  );
};

export default Suggestions;
