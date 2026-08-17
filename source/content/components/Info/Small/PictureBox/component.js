import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import ClassNames from 'classnames';
import Loader from '../../../Loader/component';
import Picture from './Picture/component';

class PictureBox extends Component {
    constructor(props) {
        super(props);
        const { front, left, right } = styles;

        this.state = {
            front,
            left,
            right,
            first: front,
            last: right,
        };

        this.switchGears = this.switchGears.bind(this);
    }

    switchGears() {
        const component = this;
        const { block, timeout } = this;
        const { albumPicture } = this.props;
        const { first, last, front, left, right } = this.state;

        if (!block || block.isConnected === false) {
            clearTimeout(timeout);
            return;
        }

        if (!albumPicture) {
            return;
        }

        if (first === front) {
            component.setState({
                first: left,
                last: front,
            });
        } else if (last === front) {
            component.setState({
                first: front,
                last: right,
            });
        }
    }

    componentDidMount() {
        this.timeout = setTimeout(this.switchGears, 5000);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    render() {
        const { switchGears } = this;
        const { artistPicture, albumPicture, extended } = this.props;
        const { first, last } = this.state;

        if (artistPicture === undefined && albumPicture === undefined) {
            return (
                <div styleName={ClassNames('wrapper_box')}>
                    <Loader />
                </div>
            );
        }
        return (
            <div
                styleName={ClassNames('wrapper_box', { extended: extended })}
                onClick={switchGears}
                ref={block => (this.block = block)}
            >
                <div className={first}>
                    <Picture key={artistPicture} picture={artistPicture} />
                </div>
                <div className={last}>
                    <Picture key={albumPicture} picture={albumPicture} />
                </div>
            </div>
        );
    }
}

export default CSSModules(PictureBox, styles, { allowMultiple: true });
