import React from 'react';
import { insertScript, removeScript, shallowComparison } from './utils';

export class DiscussionEmbed extends React.Component {
    componentWillMount() {
        if (typeof window !== 'undefined' && window.disqus_shortname &&
            window.disqus_shortname !== this.props.shortname)
            this.cleanInstance();
    }

    componentDidMount() {
        this.loadInstance();
    }

    shouldComponentUpdate(nextProps) {
        if (this.props === nextProps)
            return false;
        return shallowComparison(this.props, nextProps);
    }

    componentWillUpdate(nextProps) {
        if (this.props.shortname !== nextProps.shortname)
            this.cleanInstance();
    }

    componentDidUpdate() {
        this.loadInstance();
    }

    loadInstance() {
        const doc = window.document;
        if (window && window.DISQUS && doc.getElementById('dsq-embed-scr')) {
            window.DISQUS.reset({
                reload: true,
                config: this.getDisqusConfig(this.props.config),
            });
        } else {
            window.disqus_config = this.getDisqusConfig(this.props.config);
            window.disqus_shortname = this.props.shortname;
            insertScript(`https://${this.props.shortname}.disqus.com/embed.js`, 'dsq-embed-scr', doc.body);
        }
    }

    cleanInstance() {
        const doc = window.document;
        removeScript('dsq-embed-scr', doc.body);
        if (window && window.DISQUS)
            window.DISQUS.reset({});

        try {
            delete window.DISQUS;
        } catch (error) {
            window.DISQUS = undefined;
        }
        const disqusThread = doc.getElementById('disqus_thread');
        if (disqusThread) {
            while (disqusThread.hasChildNodes())
                disqusThread.removeChild(disqusThread.firstChild);
        }
    }

    getDisqusConfig(config) {
        return function () {
            this.page.identifier = config.identifier;
            this.page.url = config.url;
            this.page.title = config.title;
            this.page.remote_auth_s3 = config.remoteAuthS3;
            this.page.api_key = config.apiKey;
            this.callbacks.onNewComment = [
                config.onNewComment,
            ];
        };
    }

    render() {
        return (
            <div id="disqus_thread"></div>
        );
    }
}
