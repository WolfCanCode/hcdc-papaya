import React, {useState} from "react"
import styles from "./HomePage.module.css"
import {Button, Input, Space, Table} from "antd";
import axios from "axios";
import {useMountEffect} from '@react-hookz/web';
import {PhoneOutlined, SearchOutlined} from "@ant-design/icons";
import utils from "../../config/utils";
import * as CSV from 'csv-string';

const {Search} = Input

const HomePageDesktop = () => {
    const [dataSource, setDataSource] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [columns, setColumns] = useState([])

    const [, setSearchText] = useState("")
    const [, setSearchedColumn] = useState("")
    let searchInput;
    let currentDistrictValue;
    let oldColumn;
    let oldData;

    const getWardFilter = (value) => {
        if (value !== currentDistrictValue) {
            currentDistrictValue = value
            const pos = oldColumn.findIndex(c => c.key === "ward")
            if (pos !== -1) {
                let newColumns = [...oldColumn]
                const wards = utils.distinct(oldData.filter(ds => ds.district === currentDistrictValue).map(d => d.ward)).map(d => ({
                    text: d,
                    value: d
                }));
                newColumns[pos].filters = wards
                setColumns(newColumns)
            }
        }
    }
    const getList = async () => {
        const response = await axios.get(process.env.REACT_APP_GOOGLE_SHEET_URL).catch(e => {
            getList()
        })
        if (response) {
            let dataCSV = CSV.parse(response.data)
            dataCSV.splice(0,1)
            const data = dataCSV.map(csvRow=>({key:csvRow[0],name:csvRow[1],profession:csvRow[2],phone:csvRow[3],level:csvRow[4],district:csvRow[5],ward:csvRow[6]}))
            let filterLevel = utils.distinct(data.map(d => d.level))
            let filterDistrict = utils.distinct(data.map(d => d.district))
            let filterProfession = utils.distinct(data.map(d => d.profession))
            setDataSource(data)
            oldData = data;
            oldColumn = [
                {
                    title: 'Tên',
                    dataIndex: 'name',
                    key: 'name',
                    fixed: 'left',
                    width: 200,
                    ...getColumnSearchProps('name', 'Tên'),
                },
                {
                    title: 'Chức vụ',
                    dataIndex: 'profession',
                    key: 'profession',
                    filters: filterProfession.map(d => ({text: d, value: d})),
                    onFilter: (value, record) => value === record.profession,

                },
                {
                    title: 'Số điện thoại',
                    dataIndex: 'phone',
                    key: 'phone',
                    render: (text) => text ? <Button icon={<PhoneOutlined/>} type={'link'}
                                              onClick={() => window.open(`tel:${text}`)}>{text}</Button> : ''
                },
                {
                    title: 'Cấp địa phương',
                    dataIndex: 'level',
                    key: 'level',
                    filters: filterLevel.map(d => ({text: d, value: d})),
                    onFilter: (value, record) => value === record.level,

                },
                {
                    title: 'Phường',
                    dataIndex: 'ward',
                    key: 'ward',
                    filters: [],
                    onFilter: (value, record) => value === record.ward,
                },
                {
                    title: 'Quận',
                    dataIndex: 'district',
                    key: 'district',
                    width: 150,
                    filters: filterDistrict.map(d => ({text: d, value: d})),
                    onFilter: (value, record) => {
                        getWardFilter(value)
                        return value === record.district
                    },
                },
            ]
            setColumns(oldColumn)
            setLoading(false)
        }
    }

    useMountEffect(() => getList())


    const getColumnSearchProps = (dataIndex, title) => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
            <div style={{padding: 8}}>
                <Input
                    ref={node => {
                        searchInput = node;
                    }}
                    placeholder={`Tìm kiếm ${title}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{marginBottom: 8, display: 'block'}}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{width: 90}}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{width: 90}}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.select(), 100);
            }
        },
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    }

    const handleReset = clearFilters => {
        clearFilters()
        setSearchText('')
    }

    return (
        <div className={styles.container}>

            <Table
                loading={loading}
                scroll={{x: 1500}}
                title={() => (
                    <div>
                        <h1><img alt={'papaya hcdc logo'}
                                 src={'https://hcdc.vn/public/img/02bf8460bf0d6384849ca010eda38cf8e9dbc4c7/images/information/img-8-8.png'}
                                 height={80}/>Tổ phản ứng nhanh quận/huyện, phường/xã</h1>
                        <Search placeholder="Tìm kiếm..." size={"large"} onChange={(e) => setSearch(e.target.value)}/>
                    </div>
                )}
                columns={columns}
                dataSource={search.trim().length ? dataSource.filter(d => d.name.toLowerCase().trim().includes(search.toLowerCase().trim())) : dataSource}
            />
        </div>
    )
}

export default HomePageDesktop