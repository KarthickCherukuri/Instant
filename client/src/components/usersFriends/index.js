const UsersFriends = (props) => {
  const { picture, name, socket_id } = props.data;

  return (
    <div
      className="userfriend"
      style={{ backgroundColor: socket_id === undefined ? "red" : "green" }}>
      <img src={picture} alt="profile pic" className="profile-pic" />
      <h2 style={{ marginLeft: "1vw" }}>{name}</h2>
    </div>
  );
};

export default UsersFriends;
