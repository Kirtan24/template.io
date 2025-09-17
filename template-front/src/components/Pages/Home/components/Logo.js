import { FaRocket } from "react-icons/fa"; // Using an icon for the logo
import { Link } from "react-router-dom";

const Logo = () => {
  const logoStyle = {
    fontSize: "1.6rem",
    fontWeight: "800",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  };

  const iconStyle = {
    color: "#4cc9f0", // Accent color for the icon
    fontSize: "1.8rem", // Adjust the icon size to make it larger
  };

  return (
    <Link to="/" className="navbar-brand" style={logoStyle}>
      <img
        src="./assets/images/img/template_2.io.png"
        alt="Template Management Preview"
        className="rounded"
        style={{
          maxWidth: "40px",
          // height: "auto",
          maxHeight: "40px",
          objectFit: "contain",
        }}
      /> Template.io
      {/* <FaRocket style={iconStyle} /> Template.io */}
    </Link>
  );
};

export default Logo;
