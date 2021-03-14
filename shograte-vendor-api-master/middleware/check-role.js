function permit(admin) {
  return (request, response, next) => {
    if (request.userData.role && admin === request.userData.role) next();
    else {
      response.json({ message: "Access deined for this user" });
    }
  };
}
module.exports = permit;
