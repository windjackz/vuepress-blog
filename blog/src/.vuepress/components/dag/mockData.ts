import { LevelDependence } from "./interfaces";

export const mockDatas: LevelDependence[] = [
    {
        id: '1',
        dependenceIds: []
    },
    {
        id: '2',
        dependenceIds: ['1']
    },
    {
        id: '3',
        dependenceIds: ['1']
    },
    {
        id: '4',
        dependenceIds: ['2', '3']
    },
    {
        id: '5',
        dependenceIds: ['4']
    },
    {
        id: '6',
        dependenceIds: []
    },
    {
        id: '7',
        dependenceIds: ['6']
    },
    {
        id: '8',
        dependenceIds: ['7']
    },
    {
        id: '9',
        dependenceIds: ['8']
    },
    {
        id: '10',
        dependenceIds: ['9']
    },
    {
        id: '11',
        dependenceIds: ['10']
    },
    {
        id: '12',
        dependenceIds: ['11']
    },
    {
        id: '13',
        dependenceIds: ['12']
    },
    {
        id: '14',
        dependenceIds: []
    },
    {
        id: '15',
        dependenceIds: ['14', '16']
    },
    {
        id: '16',
        dependenceIds: ['14']
    },
    {
        id: '17',
        dependenceIds: ['9', '10', '12']
    },
    {
        id: '18',
        dependenceIds: ['15']
    },
    {
        id: '19',
        dependenceIds: []
    },
    {
        id: '20',
        dependenceIds: ['19']
    },
    {
        id: '21',
        dependenceIds: ['20', '23', '24']
    },
    {
        id: '22',
        dependenceIds: []
    },
    {
        id: '23',
        dependenceIds: ['19']
    },
    {
        id: '24',
        dependenceIds: ['19']
    },
    {
        id: '25',
        dependenceIds: ['20', '23', '24']
    },
    {
        id: '26',
        dependenceIds: ['21', '25']
    },
    {
        id: '27',
        dependenceIds: ['26']
    },
    {
        id: '28',
        dependenceIds: ['27']
    },
    {
        id: '29',
        dependenceIds: ['28']
    },
    {
        id: '30',
        dependenceIds: ['29']
    },
    {
        id: '31',
        dependenceIds: ['30']
    },
    {
        id: '32',
        dependenceIds: ['31']
    },
    {
        id: '33',
        dependenceIds: ['32']
    },
];