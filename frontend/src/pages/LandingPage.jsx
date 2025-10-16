import React, { useEffect } from "react";
import Navbar from "../Components/Navbar/Navbar";
import Company from "../Components/Company";
import Featured from "../Components/Featured/Featured";
import Features from "../Components/Featured/Features";
import Footer from "../Components/footer/EndFooter.jsx";

const LandingPage = () => {

  return (
    <div data-scroll-container>
      <Navbar />
      <section id="home" data-scroll-section>
        <Company />
      </section>
      <section id="features" data-scroll-section>
        <Featured />
        <Features />
      </section>
      <section id="contact" data-scroll-section>
        <Footer />
      </section>
    </div>
  );
};

export default LandingPage;
