import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import closeLightBox from '../../actions/closeLightBox';

class Config extends PureComponent {
    render() {
        const { closeLightBox } = this.props;

        return (
            <div styleName="help">
                <div styleName="title-help">
                    <span>Просьба о помощи</span>
                    <span styleName="close" onClick={closeLightBox} />
                </div>
                <div styleName="help-body">
                    <p>Дорогой друг!</p>
                    <p>
                        Мы занимаемся VK Blue уже несколько лет и вложили очень много умений и сил <br />
                        чтобы ты мог им пользоваться.
                    </p>
                    <p>Здесь нет рекламы и никогда не будет! Но нам нужна твоя помощь для дальнейшего улучшения.</p>
                    <p>
                        Как ты можешь помочь? Все очень просто:
                        <br />
                        <br />
                        Сделай репост, закинь отзыв или сделай пожертвование. <br />
                        Так ты внесешь <b>незаменимый</b> вклад в развитие проекта!
                    </p>
                    <div styleName="actions">
                        <a
                            styleName="animated-button victoria-two"
                            href={process.env.BROWSER === 'firefox' ? 'https://addons.mozilla.org/en-US/firefox/addon/vk-blue/' : 'https://goo.gl/snZfe4'}
                            target="_blank"
                            onClick={closeLightBox}
                        >
                            <span>Написать отзыв</span>
                        </a>
                        <a
                            styleName="animated-button victoria-two"
                            href="https://vk.ru/blue_player?w=app6887721_-130956055"
                            target="_blank"
                            onClick={closeLightBox}
                        >
                            <span>Поддержать</span>
                        </a>
                        <a
                            styleName="animated-button victoria-two"
                            href="https://vk.ru/blue_player?w=wall-130956055_683#"
                            target="_blank"
                            onClick={closeLightBox}
                        >
                            <span>Сделать репост</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
    closeLightBox,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CSSModules(Config, styles, { allowMultiple: true }));
