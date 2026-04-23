import { useEffect, useState } from 'react';
import { plugin } from '../core/cades-plugin';

const MAX_ATTEMP = 15;
const INTERVAL_MS = 1000;

export function useCadesPluginReady() {
    const [pluginReady, setPluginReady] = useState(false);
    const [extensionReady, setExtensionReady] = useState(false);
    const [pluginError, setPluginError] = useState<string | null>(null);
    const [extensionError, setExtensionError] = useState<unknown | null>(null);

    const isReady = pluginReady && extensionReady && !pluginError && !extensionError;

    const checkExtension = async (attempt: number) => {
        attempt++;

        if (attempt >= MAX_ATTEMP) {
            setExtensionError('Проверьте установлено ли расширение Cades Plugin');
            setExtensionReady(false);
            return;
        }

        plugin
            .CreateObjectAsync('CAdESCOM.About')
            .then(() => {
                setExtensionError(null);
                setExtensionReady(true);
            })
            .catch((error: unknown) => {
                setExtensionError(error);
                setExtensionReady(false);
            });

        setTimeout(checkExtension, INTERVAL_MS);
    };

    const checkPlugin = async (attempt: number) => {
        attempt++;

        if (window.cadesplugin) {
            setPluginReady(true);
            setPluginError(null);
            return;
        }

        if (attempt >= MAX_ATTEMP) {
            setPluginReady(false);
            setPluginError('Не удалось загрузить плагин');
            return;
        }

        setTimeout(checkPlugin, INTERVAL_MS);
    };

    useEffect(() => {
        let attemptPlugin = 0;
        let attemptExtenssion = 0;

        checkPlugin(attemptPlugin);
        checkExtension(attemptExtenssion);
    }, []);

    return { isReady, pluginReady, pluginError, extensionReady, extensionError, checkPlugin, checkExtension };
}
