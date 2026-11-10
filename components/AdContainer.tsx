
import React, { useEffect, useRef } from 'react';

interface AdContainerProps {
    code: string;
}

const AdContainer: React.FC<AdContainerProps> = ({ code }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !code) return;

        const container = containerRef.current;
        container.innerHTML = ''; // Clear previous content

        const trimmedCode = code.trim();

        // Ad networks often provide either a full embed snippet or only a
        // JavaScript URL. Supporting both keeps the admin field easy to use.
        if (/^https?:\/\/\S+$/i.test(trimmedCode)) {
            const script = document.createElement('script');
            script.src = trimmedCode;
            script.async = true;
            container.appendChild(script);
            return () => {
                container.innerHTML = '';
            };
        }

        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = trimmedCode;

        // Move children to the container and execute scripts
        Array.from(tempDiv.childNodes).forEach(node => {
            if (node.nodeName === 'SCRIPT') {
                const script = document.createElement('script');
                const src = (node as HTMLScriptElement).src;
                if (src) {
                    script.src = src;
                } else {
                    script.innerHTML = (node as HTMLScriptElement).innerHTML;
                }
                
                // Copy attributes
                Array.from((node as HTMLScriptElement).attributes).forEach(attr => {
                    script.setAttribute(attr.name, attr.value);
                });

                container.appendChild(script);
            } else {
                container.appendChild(node.cloneNode(true));
            }
        });

        return () => {
            container.innerHTML = '';
        };
    }, [code]);

    return <div ref={containerRef} className="ad-container flex justify-center my-4 overflow-hidden" />;
};

export default AdContainer;
