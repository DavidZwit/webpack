import Grid from '../Grid';

import LevelGenerator from '../LevelGenerator';
import PathChecker from '../../Backend/PathChecker';
import LineDrawer from '../LineDrawer';
import Input from '../Input';

import Tile, {TileShapes, TileIcons} from '../GridObjects/Tile';

export default class GameField extends Phaser.Group
{
    public grid: Grid;

    private _gridSpawner: LevelGenerator;
    private _pathChecker: PathChecker;
    private _gridInput: Input;
    private _lineDrawer: LineDrawer;

    /* The path that is being drawn */
    private _currentPath: Tile[];

    constructor(game: Phaser.Game)
    {
        super(game);

        this.grid = new Grid(this.game, 6, 6, 90, .9);
        this.addChild(this.grid);

        this._gridSpawner = new LevelGenerator();
        this._pathChecker = new PathChecker();
        this._lineDrawer = new LineDrawer(game);

        this._gridInput = new Input(this.game);

        this._currentPath = [];

        this.setupGrid();

    }

    /* The initial setup for the grid */
    private setupGrid(): void
    {
        /* Generating the grid */
        let generatedLevel: Tile[] = this._gridSpawner.generateGrid(this.grid, (gridX: number, gridY: number, shape: TileShapes, icon: TileIcons) => {

            return new Tile(this.game, gridX, gridY, shape, icon);

        });

        /* Adding the generated grid to the actual grid */
        generatedLevel.forEach((tile: Tile) => {
            this.grid.add(tile);
        });

        this._gridInput.onDragSnap.add(this.addNewTile, this);
        this._gridInput.onInputUp.add(this.inputRelease, this);

        this.resize();
    }

    /* What happens if the input finds, the mouse is draggig over a new tile */
    private addNewTile(tile: Tile): void
    {
        /* Checking if the tile is already in the path */
        for (let i: number = this._currentPath.length; i--; )
        {
            if (tile === this._currentPath[i]) { return; }
        }

        this._currentPath.push(tile);

        /* Checking if the patern is possible */
        if (
            this._currentPath.length > 1 &&
            (this._pathChecker.isPatternPossible(this._currentPath) === false ||
            this._pathChecker.isNeighbour(this._currentPath[this._currentPath.length - 2], tile) === false)
        ) {
            this._currentPath.pop();
            return;
        }

        /* A new path is created */
        this.newPathCreated(this._currentPath);
    }

    /* What happens when the path input is released */
    private inputRelease(): void
    {
        if (this._currentPath.length >= 3)
        {
            for (let i: number = this._currentPath.length; i--; )
            {
                this._currentPath[i].animateOut();
            }
        }
        this.canclePath();
    }

    /* What happens when the path creaton get's canceled */
    private canclePath(): void
    {
        this._currentPath = [];
        this._lineDrawer.clearPath();
    }

    /* What happends when a new path is created */
    private newPathCreated(path: Tile[]): void
    {
        this._lineDrawer.drawPath(path);
    }

    public update(): void
    {
        this._gridInput.checkInputOnTiles(<Tile[]>this.grid.elements);
    }

    public resize(): void
    {
        let vmin: number = Math.min(this.game.width, this.game.height);

        let gridSizeMultiplier: number = vmin * .7;
        this.grid.gridBlockSize = gridSizeMultiplier / this.grid.blocksOnX;

        this.grid.position.set(
            this.game.width / 2 - this.grid.width / 2,
            this.game.height / 1.6 - this.grid.height / 2
        );
    }

    public destroy(): void
    {
        if (this.grid)
        {
            this.grid.destroy();
        }
        this.grid = null;

        this._gridSpawner = null;

        this._pathChecker = null;

        if (this._gridInput)
        {
            this._gridInput.destroy();
        }
        this._gridInput = null;

        if (this._lineDrawer)
        {
            this._lineDrawer.destroy();
        }
        this._lineDrawer = null;
    }

}