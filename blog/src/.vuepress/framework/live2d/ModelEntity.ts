import { Live2DModel } from './Live2DModel';
import { EventEmitter } from '@pixi/utils';
import { Renderer } from '@pixi/core';
import { ModelLoadingState } from './ModelLoadingState';
import { Live2DFactory } from 'pixi-live2d-display';

export class ModelEntity extends EventEmitter {

    isModelLoaded = false;
    url = '';
    error = '';
    aspectRatio = 1;
    pixiModel?: Live2DModel;
    loadingState = new ModelLoadingState();

    name = 'New Model';

    visible = true;

    private _scaleX = 1;
    private _scaleY = 1;
    private _rotation = 0;
    private _zIndex = 0;

    constructor(source: string | File[]) {
        super();

        this.loadModel(source).then();
    }

    async loadModel(source: string | File[]) {
        if (typeof source === 'string') {
            this.url = source;
        } else {
            this.url = '(Local files)';
        }

        // don't use Live2DModel.fromSync() because when loading from local files,
        // the "settingsJSONLoaded" and "settingsLoaded" events will be emitted before
        // we're able to listen to the Live2DModel instance
        // TODO: (plugin) improve model creation?
        const pixiModel = new Live2DModel();

        this.loadingState.watch(pixiModel, () => {
            this.emit('loadingProgress', this.loadingState.text);
        });

        try {
            await Live2DFactory.setupLive2DModel(pixiModel, source);

            this.modelLoaded(pixiModel);
            this.isModelLoaded = true;
            this.emit('modelLoaded', pixiModel);
        } catch (e) {
            console.warn(e);
            this.emit('modelLoadedError', e);
            this.error = e instanceof Error ? e.message : e + '';
        }
    }

    modelLoaded(pixiModel: Live2DModel) {
        this.pixiModel = pixiModel;
        this.name = pixiModel.internalModel.settings.name;
        this.aspectRatio = pixiModel.width / pixiModel.height;
    }

    fit(width: number, height: number) {
        if (this.pixiModel) {
            let scale = Math.min(width / this.pixiModel.width, height / this.pixiModel.height);

            scale = Math.round(scale * 10) / 10;

            this.scale(scale, scale);
        }
    }

    scale(scaleX?: number, scaleY?: number) {
        this._scaleX = scaleX ?? this._scaleX;
        this._scaleY = scaleY ?? this._scaleY;

        if (this.pixiModel) {
            this.pixiModel.scale.set(this._scaleX, this._scaleY);
        }
    }

    rotate(rotation: number) {
        this._rotation = rotation;

        if (this.pixiModel) {
            this.pixiModel.rotation = rotation;
        }
    }

    setZIndex(zIndex: number) {
        this._zIndex = zIndex;

        if (this.pixiModel) {
            this.pixiModel.zIndex = zIndex;
        }
    }

    setVisible(visible: boolean) {
        this.visible = visible;

        if (this.pixiModel) {
            this.pixiModel.visible = visible;
        }
    }

    destroy() {
        if (this.pixiModel) {
            this.pixiModel.destroy({ children: true });
            this.pixiModel = undefined;
        }
    }

    get zIndex(): number {
        return this._zIndex;
    }

    set zIndex(value: number) {
        this.setZIndex(value);
    }

    get rotation(): number {
        return this._rotation;
    }

    set rotation(value: number) {
        this.rotate(value);
    }

    get scaleY(): number {
        return this._scaleY;
    }

    set scaleY(value: number) {
        this.scale(undefined, value);
    }

    get scaleX(): number {
        return this._scaleX;
    }

    set scaleX(value: number) {
        this.scale(value, value);
    }
}