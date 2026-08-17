import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

class GetPro extends PureComponent {
    static defaultProps = {
        onClose: Function.prototype,
    };

    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
    }

    onClose() {
        this.props.onClose();
    }

    render() {
        const { onClose } = this;

        return (
            <div styleName="lightbox_wrapper" onClick={onClose}>
                <div styleName="lightbox" onClick={e => e.stopPropagation()}>
                    <span styleName="close" onClick={onClose}>
                        ×
                    </span>
                    <span styleName="title">VK Blue</span>
                    <a styleName="emoji" />
                    <div styleName="get-pro">
                        <h3>Ура, PRO фишки!</h3>
                        <p>
                            Получите PRO версию,
                            <br /> всего лишь нужно <br />
                            подписаться на нашу группу!
                        </p>
                        <a
                            onClick={onClose}
                            dangerouslySetInnerHTML={{
                                __html: `<div onclick="window.location.replace('https://vk.ru/blue_player')">Перейти в группу!</div>`,
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default CSSModules(GetPro, styles, { allowMultiple: true });
