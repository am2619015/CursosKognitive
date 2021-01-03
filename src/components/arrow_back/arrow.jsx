import React from "react";
import "./arrow.css";

class arrow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            url_ir : props.url_back
        }
        this.handleArrow = this.handleArrow.bind(this);
      }


      handleArrow = () =>{
        window.location.href = this.state.url_ir;
      }

        render() {
            return (
                <div className="wrapper arrow-wrapper" onClick={this.handleArrow}>
                <svg width="18px" height="17px" viewBox="0 0 18 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink">
                    <g id="prev" transform="translate(8.500000, 8.500000) scale(-1, 1) translate(-8.500000, -8.500000)">
                        <polygon className="arrow" points="16.3746667 8.33860465 7.76133333 15.3067621 6.904 14.3175671 14.2906667 8.34246869 6.908 2.42790698 7.76 1.43613596"></polygon>
                        <polygon className="arrow-fixed" points="16.3746667 8.33860465 7.76133333 15.3067621 6.904 14.3175671 14.2906667 8.34246869 6.908 2.42790698 7.76 1.43613596"></polygon>
                        <path d="M-1.48029737e-15,0.56157424 L-1.48029737e-15,16.1929159 L9.708,8.33860465 L-2.66453526e-15,0.56157424 L-1.48029737e-15,0.56157424 Z M1.33333333,3.30246869 L7.62533333,8.34246869 L1.33333333,13.4327013 L1.33333333,3.30246869 L1.33333333,3.30246869 Z"></path>
                    </g>
                </svg>
              </div>
        );
        }

}

export default arrow;