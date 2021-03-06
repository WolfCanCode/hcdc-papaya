import React, {useState} from "react"
import axios from "axios";
import {useMountEffect} from "@react-hookz/web";
import styles from "./HomePage.module.css"
import {BackTop, Button, Input, List, Select} from "antd";
import Avatar from "antd/es/avatar/avatar";
import {PhoneOutlined} from "@ant-design/icons";
import utils from "../../config/utils";
import _ from "lodash";
import * as CSV from "csv-string";

const HomePageMobile = () => {
    const [loading,setLoading] = useState(true)
    const [dataSource, setDataSource] = useState([])
    const [filterLevel,setFilterLevel] = useState([])
    const [filterDistrict,setFilterDistrict] = useState([])
    const [filterProfession,setFilterProfession] = useState([])

    const [currentLevel,setCurrentLevel] = useState()
    const [currentDistrict,setCurrentDistrict] = useState()
    const [currentProfession,setCurrentProfession] = useState()
    const [currentWard,setCurrentWard] = useState()
    const [search,setSearch] = useState()


    const getList = async () => {
        const response = await axios.get(process.env.REACT_APP_GOOGLE_SHEET_URL).catch(e => {
            getList()
        })
        if (response) {
            let dataCSV = CSV.parse(response.data)
            dataCSV.splice(0,1)
            const data = dataCSV.map(csvRow=>({key:csvRow[0],name:csvRow[1],profession:csvRow[2],phone:csvRow[3].replaceAll(".",""),level:csvRow[4],district:csvRow[5],ward:csvRow[6]}))
            setDataSource(data)
            let filterLevel = utils.distinct(data.map(d=>d.level))
            setFilterLevel(filterLevel)
            let filterDistrict = utils.distinct(data.map(d=>d.district))
            setFilterDistrict(filterDistrict)
            let filterProfession = utils.distinct(data.map(d=>d.profession))
            setFilterProfession(filterProfession)
            setLoading(false)
        }
    }


    const processData = () => dataSource.filter(ds=>{
        let result = true
        if(currentLevel && currentLevel !== ds.level) {
            result=false
        }
        if(currentProfession && currentProfession !== ds.profession) {
            result=false
        }
        if(currentDistrict && currentDistrict !== ds.district) {
            result=false
        }
        if(currentWard && currentWard !== ds.ward) {
            result=false
        }
        if(search && !ds.name.toLowerCase().trim().includes(search.toLowerCase().trim())) {
            result=false
        }
        return result
    })

    useMountEffect(() => getList())
    return (<div className={styles.container}>
        <div className={styles.headerContainer}><img alt={'papaya hcdc logo'} src={'https://hcdc.vn/public/img/02bf8460bf0d6384849ca010eda38cf8e9dbc4c7/images/information/img-8-8.png'} height={50}/><h3>T??? ph???n ???ng nhanh qu???n/huy???n, ph?????ng/x??</h3></div>
        <div className={styles.filterContainer}>
            <div className={styles.filterBox}>
                <label>Ch???c v???:</label>
                <Select placeholder={'L???c theo ch???c v???'} onChange={value=>setCurrentProfession(value)}>
                    <Select.Option value={""}>
                        B??? ch???n
                    </Select.Option>
                    {filterProfession.map(proItem => <Select.Option value={proItem}>{proItem}</Select.Option>)}
                </Select>
            </div>

            <div className={styles.filterBox}>
                <label>C???p ?????a ph????ng:</label>
                <Select placeholder={'L???c theo c???p ?????a ph????ng'} onChange={value=>setCurrentLevel(value)}>
                    <Select.Option value={""}>
                        B??? ch???n
                    </Select.Option>
                    {filterLevel.map(level => <Select.Option value={level}>{level}</Select.Option>)}
                </Select>
            </div>

            <div className={styles.filterBox}>
                <label>Qu???n:</label>
                <Select placeholder={'L???c theo qu???n'} onChange={value=>setCurrentDistrict(value)}>
                    <Select.Option value={""}>
                        B??? ch???n
                    </Select.Option>
                    {filterDistrict.map(dis => <Select.Option value={dis}>{dis}</Select.Option>)}
                </Select>
            </div>

            {currentDistrict ? <div className={styles.filterBox}>
                <label>Ph?????ng:</label>
                <Select placeholder={'L???c theo ph?????ng'} onChange={value=>setCurrentWard(value)}>
                    {utils.distinct(dataSource.filter(ds=>ds.district===currentDistrict).map(final=>final.ward)).map(dis => <Select.Option value={dis}>{dis}</Select.Option>)}
                </Select>
            </div> : ''}
        </div>
        <Input.Search size={"medium"} className={styles.search} placeholder={'T??m ki???m ...'} onChange={_.debounce((e)=>setSearch(e.target.value),600)} />
        <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={processData()}
            pagination={{
                size: 'small',
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                total: processData().length,
                showLessItems: true
            }}
            renderItem={item => (
                <List.Item>
                    <List.Item.Meta
                        avatar={<Avatar src="https://media-exp1.licdn.com/dms/image/C510BAQHT5Eb2jiUzSw/company-logo_200_200/0/1578034223463?e=2159024400&v=beta&t=jT3oNiljPRP3bJJZovX2gvJrc_zyXU-1wW8fb9RuuzE"/>}
                        title={<div>{item.name} </div>}
                        description={<div>
                            <Button className={styles.phoneBtn} icon={<PhoneOutlined />} type="link" onClick={()=>{
                               window.open(`tel:${item.phone}`, '_blank')
                            }}>{item.phone}</Button>
                            <div>Ch???c v???: <b>{item.profession}</b></div>
                            <div>C???p ?????a ph????ng: <b>{item.level}</b></div>
                            {item.ward ? <div>Ph?????ng: <b>{item.ward}</b></div> : ''}
                            <div>Qu???n: <b>{item.district}</b></div>
                        </div>}
                    />
                </List.Item>
            )}
        />
        <BackTop />
    </div>)
}

export default HomePageMobile