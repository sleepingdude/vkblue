import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import Loader from '../../../../Loader/component';
import loadPicture from '../../../../../helpers/load_picture';

class Picture extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: false,
            picture: null,
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.updatePicture(this.props.picture);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate(prevProps) {
        if (this.props.picture !== prevProps.picture) {
            this.setState({ error: false });
            this.updatePicture(this.props.picture);
        }
    }

    async updatePicture(url) {
        if (url === undefined) {
            if (this._isMounted) {
                this.setState({ picture: null, error: false });
            }
            return;
        }

        if (url === null) {
            if (this._isMounted) {
                this.setState({ picture: null, error: true });
            }
            return;
        }

        try {
            const picture = await loadPicture(url);

            if (!this._isMounted) return;

            if (this.props.picture !== url) return;

            this.setState({
                picture,
                error: false,
            });
        } catch (e) {
            if (!this._isMounted) return;

            this.setState({
                picture: null,
                error: true,
            });
        }
    }

    render() {
        const { error, picture } = this.state;

        if (picture === undefined || !picture?.startsWith('blob:')) {
            return (
                <div styleName="wrapper_picture">
                    <Loader />
                </div>
            );
        }

        if (picture === null || error) {
            return (
                <div styleName="wrapper_picture">
                    <div styleName="empty_picture" />
                </div>
            );
        }

        return (
            <div
                styleName="wrapper_picture"
                style={{
                    backgroundImage: `url(${picture})`,
                }}
            />
        );
    }
}

export default CSSModules(Picture, styles);