(function ($) {
    "use strict";

    /*Sale statistics Chart*/
    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        var orderData = document.getElementById('orderDataChart').value

        const order = JSON.parse(orderData);
        let Jan = 0,
         Feb = 0, Mar = 0,Apr = 0, May = 0, Jun = 0, Jul = 0, Aug = 0,
           Sep = 0,  Oct = 0, Nov = 0, Dec = 0;

        let monthlyEarning = {Jan:0,Feb:0,Mar:0,Apr:0,May:0,Jun:0,Jul:0,
                                Aug:0,Sep:0,Oct:0,Nov:0,Dec:0}

        let yearlyOrder = {2020:0,2021:0,2022:0,2023:0,2024:0}                        

        if (order && order.length > 0) { 
            
            order.forEach((order)=>{ 
                for(let i=0;i<order.items.length;i++){ 
                    let orderMonth = order.date.substr(0,3)

                    let orderYear = order.date.substr(-4)
                    if(order.items[i].status==='delivered' && orderYear==='2024'){
                        yearlyOrder[2024] ++
                    }







                   if(order.items[i].status==='delivered' && orderMonth==='Jan'){
                       Jan++
                       monthlyEarning.Jan += order.items[i].total_price
                   }else if(order.items[i].status==='delivered' && orderMonth==='Feb'){
                        Feb++
                        monthlyEarning.Feb += order.items[i].total_price
                   }else if(order.items[i].status==='delivered' && orderMonth==='Mar'){
                    Mar++
                    monthlyEarning.Mar += order.items[i].total_price
                    }else if(order.items[i].status==='delivered' && orderMonth==='Apr'){
                         Apr++
                         monthlyEarning.Apr += order.items[i].total_price
                    }else if(order.items[i].status==='delivered' && orderMonth==='May'){
                        May++
                        monthlyEarning.May += order.items[i].total_price
                    }else if(order.items[i].status==='delivered' && orderMonth==='Jun'){
                     Jun++
                     monthlyEarning.Jun += order.items[i].total_price
                    }else if(order.items[i].status==='delivered' && orderMonth==='Jul'){
                        Jul++
                        monthlyEarning.Jul += order.items[i].total_price
                   }
                   else if(order.items[i].status==='delivered' && orderMonth==='Aug'){
                    Aug++
                    monthlyEarning.Aug += order.items[i].total_price
                    }
                    else if(order.items[i].status==='delivered' && orderMonth==='Sep'){
                        Sep++
                        monthlyEarning.Sep += order.items[i].total_price
                   }else if(order.items[i].status==='delivered' && orderMonth==='Oct'){
                    Oct++
                    monthlyEarning.Oct += order.items[i].total_price
                     }else if(order.items[i].status==='delivered' && orderMonth==='Nov'){
                        Nov++
                        monthlyEarning.Nov += order.items[i].total_price
                   }else if(order.items[i].status==='delivered' && orderMonth==='Dec'){
                    Dec++
                    monthlyEarning.Dec += order.items[i].total_price
               }
                   
                }
            })
        }
        let totalEarnings = 0
        for(let month in monthlyEarning){
            totalEarnings += monthlyEarning[month]
        }
        
        let avgMonthEarnings = 0
        if(totalEarnings>0){
            avgMonthEarnings = totalEarnings/12
        }

        document.getElementById('monthlyearning').innerText = `₹${parseInt(avgMonthEarnings)}.00`
         
        


        

        
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            
            // The data for our dataset
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                        label: 'Monthly Sales',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(44, 120, 220, 0.2)',
                        borderColor: 'rgba(44, 120, 220)',
                        data:[Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
                    },
                    
                    // {
                    //     label: 'Visitors',
                    //     tension: 0.3,
                    //     fill: true,
                    //     backgroundColor: 'rgba(4, 209, 130, 0.2)',
                    //     borderColor: 'rgb(4, 209, 130)',
                    //     data: [40, 20, 17, 9, 23, 35, 39, 30, 34, 25, 27, 17]
                    // },
                    // {
                    //     label: 'Products',
                    //     tension: 0.3,
                    //     fill: true,
                    //     backgroundColor: 'rgba(380, 200, 230, 0.2)',
                    //     borderColor: 'rgb(380, 200, 230)',
                    //     data: [30, 10, 27, 19, 33, 15, 19, 20, 24, 15, 37, 6]
                    // }

                ]
            },


            options: {
                plugins: {
                legend: {
                    labels: {
                    usePointStyle: true,
                    },
                }
                }
            },
            
            
            
        });
        
        

    





        function updateChart(interval) {
            
            var newData = {
                labels: interval === 'Monthly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['2020', '2021', '2022', '2023','2024'],
                datasets: [{
                    label: interval === 'Monthly' ? 'Monthly Sales' : 'Yearly Sales',
                    data: interval === 'Monthly' ? [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec] : [yearlyOrder[2020], yearlyOrder[2021], yearlyOrder[2022], yearlyOrder[2023], yearlyOrder[2024]],
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(44, 120, 220, 0.2)',
                    borderColor: 'rgba(44, 120, 220)',
                }]
            };

            chart.data = newData;
            chart.update();
            
        }


        document.getElementById('interval').addEventListener('change', function() {
            var selectedInterval = this.value;
            updateChart(selectedInterval);
        });

    } //End if

    /*Sale statistics Chart*/
    if ($('#myChart2').length) {

        var orderData = document.getElementById('orderDataChart').value

        const order = JSON.parse(orderData);
        let category = {sofa:0,chair:0,bed:0,table:0}
        if(order && order.length > 0){
            order.forEach((order)=>{
                order.items.forEach((orderItem)=>{
                    if(orderItem.status === 'delivered' && orderItem.product_id.category === 'sofa'){
                        category.sofa++
                    }else if(orderItem.status === 'delivered' && orderItem.product_id.category === 'bed'){
                        category.bed++
                    }else if(orderItem.status === 'delivered' && orderItem.product_id.category === 'chair'){
                        category.chair++
                    }else if(orderItem.status === 'delivered' && orderItem.product_id.category === 'table'){
                        category.table++
                    }
                })
            })
        }

        var ctx = document.getElementById("myChart2");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ["Total"],
            datasets: [
                {
                    label: "Sofa",
                    backgroundColor: "#5897fb",
                    barThickness:40,
                    data: [category.sofa]
                }, 
                {
                    label: "Chair",
                    backgroundColor: "#7bcf86",
                    barThickness:40,
                    data: [category.chair]
                },
                {
                    label: "Bed",
                    backgroundColor: "#ff9076",
                    barThickness:40,
                    data: [category.bed]
                },
                {
                    label: "Table",
                    backgroundColor: "#d595e5",
                    barThickness:40,
                    data: [category.table]
                },
            ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                        usePointStyle: true,
                        },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } //end if
    
})(jQuery);