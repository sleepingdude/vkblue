import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

const Component = function() {
    return (
        <div styleName="wrapper">
            <span>
                Мы уже работаем над обновлением.{' '}
                <a href="https://vk.ru/blue_player" target="_blank">
                    Новости тут
                </a>
            </span>
            <i>Blue</i>
        </div>
    );
};

export default CSSModules(Component, styles);
