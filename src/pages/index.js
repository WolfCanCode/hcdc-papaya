import HomePageDesktop from "./HomePage/desktop"
import HomePageMobile from "./HomePage/mobile"
import React from "react";
import {useMeasure} from "@react-hookz/web";

const HomePage = () => {
    const [measurements, ref] = useMeasure();

    return (
        <div ref={ref}>
            {measurements ? measurements?.width > 500 ? <HomePageDesktop/> : <HomePageMobile/> : <HomePageDesktop/>}
        </div>
    )
}

export default HomePage;
